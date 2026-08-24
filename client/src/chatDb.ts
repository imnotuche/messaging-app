//import modules
import { openDB } from "idb";
import type { DBSchema, IDBPDatabase } from "idb";

//shape stored locally, a superset of the server Message row plus a client-only status flag
export type CachedMessage = {
    id: number | null; //null until the server assigns one, keeps optimistic rows queryable
    conversation_id: number;
    sender_id: string;
    receiver_id: string;
    message: string;
    client_id: string;
    is_received: boolean;
    received_at: string | null;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
    status: "sending" | "sent" | "failed";
};

interface ChatDBSchema extends DBSchema {
    messages: {
        key: string; //client_id, always present, identity never changes across the optimistic -> confirmed lifecycle
        value: CachedMessage;
        indexes: { "by-conversation": number; "by-server-id": number };
    };
    meta: {
        key: string;
        value: { key: string; value: string };
    };
}

let dbPromise: Promise<IDBPDatabase<ChatDBSchema>> | null = null;

//singleton, same reasoning as the socket instance, opened once and reused everywhere
function getDb() {
    if (!dbPromise) {
        dbPromise = openDB<ChatDBSchema>("chat_cache", 1, {
            upgrade(db) {
                const messageStore = db.createObjectStore("messages", { keyPath: "client_id" });
                messageStore.createIndex("by-conversation", "conversation_id");
                messageStore.createIndex("by-server-id", "id");

                db.createObjectStore("meta", { keyPath: "key" });
            },
        });
    }
    return dbPromise;
}

//upsert a single message, used for optimistic sends and incoming server messages alike
export async function cacheMessage(message: CachedMessage) {
    const db = await getDb();
    await db.put("messages", message);
}

//bulk upsert, used after a rest page load or a sync catch up
export async function cacheMessages(messages: CachedMessage[]) {
    const db = await getDb();
    const tx = db.transaction("messages", "readwrite");
    await Promise.all(messages.map((m) => tx.store.put(m)));
    await tx.done;
}

//newest-first page for a conversation, mirrors the /chat/messages cursor shape
export async function getCachedMessages(conversationId: number, limit: number, beforeId?: number) {
    const db = await getDb();
    const all = await db.getAllFromIndex("messages", "by-conversation", conversationId);

    //index cant sort DESC natively, cache pages are small enough that sorting client side is cheap
    const sorted = all
        .filter((m) => m.id !== null && (!beforeId || m.id! < beforeId))
        .sort((a, b) => b.id! - a.id!);

    return sorted.slice(0, limit);
}

//every message still marked sending/failed, replayed on reconnect
export async function getPendingMessages() {
    const db = await getDb();
    const all = await db.getAll("messages");
    return all.filter((m) => m.status === "sending" || m.status === "failed");
}

//reconciles an optimistic row with the real server row once the send is acked, keyed on client_id so identity never changes
export async function confirmMessage(clientId: string, serverMessage: Partial<CachedMessage>) {
    const db = await getDb();
    const existing = await db.get("messages", clientId);
    await db.put("messages", { ...existing, ...serverMessage, client_id: clientId, status: "sent" } as CachedMessage);
}

//flags a send as failed without losing the row, so it survives a refresh and can be retried
export async function markMessageFailed(clientId: string) {
    const db = await getDb();
    const existing = await db.get("messages", clientId);
    if (existing) await db.put("messages", { ...existing, status: "failed" });
}

//patches delivery/read ticks onto an already cached message, looked up by the real server id
export async function updateMessageStatus(serverId: number, patch: Partial<CachedMessage>) {
    const db = await getDb();
    const matches = await db.getAllFromIndex("messages", "by-server-id", serverId);
    for (const existing of matches) {
        await db.put("messages", { ...existing, ...patch });
    }
}

//last sync timestamp, read on socket reconnect to know how far back to catch up
export async function getLastSyncedAt() {
    const db = await getDb();
    const row = await db.get("meta", "lastSyncedAt");
    return row?.value ?? null;
}

export async function setLastSyncedAt(timestamp: string) {
    const db = await getDb();
    await db.put("meta", { key: "lastSyncedAt", value: timestamp });
}

//wipe everything, called on sign out same as the other stores reset
export async function clearChatCache() {
    const db = await getDb();
    await db.clear("messages");
    await db.clear("meta");
}