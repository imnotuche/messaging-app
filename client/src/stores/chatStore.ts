import { create } from "zustand";

import { getConversations, getConversationSummary, getMessages, markRead, syncChat, openConversation } from "../services/chatService";
import { useAuthStore } from "./authStore";
import { getSocket } from "../socket";
import type { CachedMessage } from "../chatDb";
import {
    cacheMessage,
    cacheMessages,
    getCachedMessages,
    getPendingMessages,
    confirmMessage,
    markMessageFailed,
    updateMessageStatus,
    getLastSyncedAt,
    setLastSyncedAt,
    clearChatCache,
} from "../chatDb";

export type ConversationSummary = {
    conversation_id: number;
    other_user_id: string;
    last_message: string | null;
    last_message_time: string | null;
    last_message_sender_id: string | null;
    unread_count: number;
};

//normalizes a raw server row (0/1 ints for booleans, raw ints for ids) into our cache shape
function toCachedMessage(raw: any): CachedMessage {
    return {
        id: raw.id,
        conversation_id: raw.conversation_id,
        sender_id: String(raw.sender_id),
        receiver_id: String(raw.receiver_id),
        message: raw.message,
        client_id: raw.client_id,
        is_received: !!raw.is_received,
        received_at: raw.received_at,
        is_read: !!raw.is_read,
        read_at: raw.read_at,
        created_at: raw.created_at,
        status: "sent",
    };
}

type ChatStoreProps = {
    conversations: ConversationSummary[];
    selectedConversationId: number | null;
    selectedOtherUserId: string | null;
    messages: CachedMessage[]; //oldest first, for the currently selected conversation only
    hasMoreMessages: boolean;
    isLoadingConversations: boolean;
    isLoadingMessages: boolean;
    isLoadingMore: boolean;
    typingUserId: string | null;
    typingDebounceTimer: ReturnType<typeof setTimeout> | null;

    fetchConversations: () => Promise<void>;
    selectConversation: (conversationId: number, otherUserId: string) => Promise<void>;
    closeConversation: () => void;
    loadMoreMessages: () => Promise<void>;
    sendMessage: (text: string) => Promise<void>;
    retryMessage: (clientId: string) => Promise<void>;
    setTyping: () => void;
    openConversationWithUser: (targetUserId: string) => Promise<number>;

    //socket event handlers, wired from socket.ts same as presence/notification
    handleNewMessage: (raw: any) => Promise<void>;
    handleMessageSent: (clientId: string, raw: any) => void;
    handleMessageFailed: (clientId: string) => void;
    handleConversationUpdate: (conversationId: number) => Promise<void>;
    handleMessageStatus: (messageId: number, status: "received") => void;
    handleMessageRead: (messageIds: number[]) => void;
    handleTypingStart: (userId: string) => void;
    handleTypingStop: (userId: string) => void;

    syncOnReconnect: () => Promise<void>;
    reset: () => void;
};

export const useChatStore = create<ChatStoreProps>()((set, get) => ({

    conversations: [],
    selectedConversationId: null,
    selectedOtherUserId: null,
    messages: [],
    hasMoreMessages: true,
    isLoadingConversations: false,
    isLoadingMessages: false,
    isLoadingMore: false,
    typingUserId: null,
    typingDebounceTimer: null,

    fetchConversations: async () => {

        set({ isLoadingConversations: true });

        try {
            const response = await getConversations();
            set({ conversations: response.data.conversations || [] });
        } catch (err) {
            console.error("Failed to fetch conversations:", err);
        } finally {
            set({ isLoadingConversations: false });
        }

    },

    selectConversation: async (conversationId, otherUserId) => {

        const otherUserIdStr = String(otherUserId);
        const socket = getSocket();
        const previous = get().selectedConversationId;

        //leave the old room before joining the new one, dont keep listening to a chat thats no longer open
        if (previous) socket?.emit("leave_conversation", { conversation_id: previous });

        set({
            selectedConversationId: conversationId,
            selectedOtherUserId: otherUserIdStr,
            messages: [],
            hasMoreMessages: true,
            typingUserId: null,
            isLoadingMessages: true,
        });

        socket?.emit("join_conversation", { conversation_id: conversationId });

        //cache first so the screen isnt blank while the network call is in flight
        const cached = await getCachedMessages(conversationId, 100);
        if (cached.length > 0) set({ messages: cached.slice().reverse() });

        try {
            const response = await getMessages(conversationId, undefined, 100);
            const serverMessages: CachedMessage[] = response.data.messages.map(toCachedMessage);

            await cacheMessages(serverMessages);

            set({
                messages: serverMessages.slice().reverse(),
                hasMoreMessages: serverMessages.length === 100,
            });
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        } finally {
            set({ isLoadingMessages: false });
        }

        try {
            await markRead(conversationId);
            set((state) => ({
                conversations: state.conversations.map((c) =>
                    c.conversation_id === conversationId ? { ...c, unread_count: 0 } : c
                ),
            }));
        } catch (err) {
            console.error("Failed to mark conversation read:", err);
        }

    },

    closeConversation: () => {

        const { selectedConversationId } = get();
        if (selectedConversationId) {
            getSocket()?.emit("leave_conversation", { conversation_id: selectedConversationId });
        }
        set({ selectedConversationId: null, selectedOtherUserId: null, messages: [], typingUserId: null });

    },

    loadMoreMessages: async () => {

        const { selectedConversationId, messages, hasMoreMessages, isLoadingMore } = get();
        if (!selectedConversationId || !hasMoreMessages || isLoadingMore || messages.length === 0) return;

        set({ isLoadingMore: true });

        try {
            const oldest = messages[0]; //oldest-first array, index 0 is the cursor
            const response = await getMessages(selectedConversationId, oldest.id!, 100);
            const older: CachedMessage[] = response.data.messages.map(toCachedMessage);

            await cacheMessages(older);

            set({
                messages: [...older.slice().reverse(), ...messages],
                hasMoreMessages: older.length === 100,
            });
        } catch (err) {
            console.error("Failed to load more messages:", err);
        } finally {
            set({ isLoadingMore: false });
        }

    },

    sendMessage: async (text) => {

        const { selectedConversationId, selectedOtherUserId } = get();
        if (!selectedConversationId || !selectedOtherUserId || !text.trim()) return;

        const auth = useAuthStore.getState();
        const clientId = crypto.randomUUID();

        const optimistic: CachedMessage = {
            id: null,
            conversation_id: selectedConversationId,
            sender_id: String(auth.user.user_id),
            receiver_id: selectedOtherUserId,
            message: text,
            client_id: clientId,
            is_received: false,
            received_at: null,
            is_read: false,
            read_at: null,
            created_at: new Date().toISOString(),
            status: "sending",
        };

        //optimistic render + cache immediately, dont wait on the socket round trip
        set((state) => ({ messages: [...state.messages, optimistic] }));
        await cacheMessage(optimistic);

        const socket = getSocket();
        if (!socket || !socket.connected) {
            //no live connection, leave it queued as "sending", syncOnReconnect replays it once back online
            return;
        }

        socket.emit("send_message", {
            target_user_id: selectedOtherUserId,
            message: text,
            client_id: clientId,
        });

    },

    retryMessage: async (clientId) => {

        const message = get().messages.find((m) => m.client_id === clientId);
        if (!message) return;

        set((state) => ({
            messages: state.messages.map((m) => (m.client_id === clientId ? { ...m, status: "sending" } : m)),
        }));
        await cacheMessage({ ...message, status: "sending" });

        const socket = getSocket();
        socket?.emit("send_message", {
            target_user_id: message.receiver_id,
            message: message.message,
            client_id: clientId,
        });

    },

    //debounced, one typing_start per burst of keystrokes, typing_stop fires 2s after the last one
    setTyping: () => {

        const { selectedConversationId, typingDebounceTimer } = get();
        if (!selectedConversationId) return;

        const socket = getSocket();

        if (!typingDebounceTimer) {
            socket?.emit("typing_start", { conversation_id: selectedConversationId });
        }

        if (typingDebounceTimer) clearTimeout(typingDebounceTimer);

        const timer = setTimeout(() => {
            socket?.emit("typing_stop", { conversation_id: selectedConversationId });
            set({ typingDebounceTimer: null });
        }, 2000);

        set({ typingDebounceTimer: timer });

    },

    //used by the message button on a profile, gets or creates the conversation then opens it
    openConversationWithUser: async (targetUserId) => {

        const response = await openConversation(targetUserId);
        const conversationId = response.data.conversation_id;

        await get().selectConversation(conversationId, targetUserId);

        return conversationId;

    },

    handleNewMessage: async (raw) => {

        const message = toCachedMessage(raw);
        const { selectedConversationId } = get();

        cacheMessage(message); //fire and forget, dont block the ui on a cache write

        //own message echoed back reconciles via message_sent instead, skip duplicating it here
        const auth = useAuthStore.getState();
        if (message.sender_id === String(auth.user.user_id)) return;

        if (message.conversation_id === selectedConversationId) {
            set((state) => ({ messages: [...state.messages, message] }));

            //chat is open right now, this counts as delivered immediately
            const socket = getSocket();
            socket?.emit("message_delivered", { message_id: message.id, conversation_id: message.conversation_id });

            //the conversation is open and this message is already visible, count it as read right away too
            try {
                await markRead(message.conversation_id);
                set((state) => ({
                    conversations: state.conversations.map((c) =>
                        c.conversation_id === message.conversation_id ? { ...c, unread_count: 0 } : c
                    ),
                }));
            } catch (err) {
                console.error("Failed to mark live message read:", err);
            }
        }

    },

    handleMessageSent: (clientId, raw) => {

        const confirmed = toCachedMessage(raw);

        confirmMessage(clientId, confirmed);

        set((state) => ({
            messages: state.messages.map((m) => (m.client_id === clientId ? confirmed : m)),
        }));

    },

    handleMessageFailed: (clientId) => {

        markMessageFailed(clientId);

        set((state) => ({
            messages: state.messages.map((m) => (m.client_id === clientId ? { ...m, status: "failed" } : m)),
        }));

    },

    handleConversationUpdate: async (conversationId) => {

        const exists = get().conversations.some((c) => c.conversation_id === conversationId);

        //brand new conversation, no lightweight summary shape for a row we dont have yet
        if (!exists) {
            await get().fetchConversations();
            return;
        }

        try {
            const response = await getConversationSummary(conversationId);
            const summary = response.data.summary;

            //if this conversation is open right now, we own its read state locally, dont let a stale server count overwrite it
            const isCurrentlyOpen = conversationId === get().selectedConversationId;
            const unreadCount = isCurrentlyOpen ? 0 : summary.unread_count;

            set((state) => ({
                conversations: state.conversations
                    .map((c) => (c.conversation_id === conversationId ? { ...c, ...summary, unread_count: unreadCount, conversation_id: conversationId } : c))
                    .sort((a, b) => new Date(b.last_message_time ?? 0).getTime() - new Date(a.last_message_time ?? 0).getTime()),
            }));
        } catch (err) {
            console.error("Failed to refresh conversation summary:", err);
        }

    },

    handleMessageStatus: (messageId, status) => {

        if (status !== "received") return;

        updateMessageStatus(messageId, { is_received: true, received_at: new Date().toISOString() });

        set((state) => ({
            messages: state.messages.map((m) => (m.id === messageId ? { ...m, is_received: true } : m)),
        }));

    },

    handleMessageRead: (messageIds) => {

        for (const id of messageIds) {
            updateMessageStatus(id, { is_read: true, read_at: new Date().toISOString() });
        }

        set((state) => ({
            messages: state.messages.map((m) => (m.id && messageIds.includes(m.id) ? { ...m, is_read: true } : m)),
        }));

    },

    handleTypingStart: (userId) => set({ typingUserId: String(userId) }),

    handleTypingStop: (userId) =>
        set((state) => (state.typingUserId === String(userId) ? { typingUserId: null } : state)),

    syncOnReconnect: async () => {

        const since = await getLastSyncedAt();

        //first ever connection, nothing to catch up on, just set the baseline
        if (!since) {
            await setLastSyncedAt(new Date().toISOString());
            return;
        }

        try {
            const response = await syncChat(since);
            const { new_messages, status_updates } = response.data;

            for (const raw of new_messages) {
                await get().handleNewMessage(raw);
            }

            for (const update of status_updates) {
                await updateMessageStatus(update.id, {
                    is_received: !!update.is_received,
                    received_at: update.received_at,
                    is_read: !!update.is_read,
                    read_at: update.read_at,
                });
            }

            //replay anything still stuck as sending/failed from before the drop
            const pending = await getPendingMessages();
            for (const message of pending) {
                get().retryMessage(message.client_id);
            }

            //pull the currently open conversation back out of the cache so status patches above actually render
            const { selectedConversationId } = get();
            if (selectedConversationId) {
                const refreshed = await getCachedMessages(selectedConversationId, 200);
                set({ messages: refreshed.slice().reverse() });
            }

            await setLastSyncedAt(new Date().toISOString());
            await get().fetchConversations();
        } catch (err) {
            console.error("Failed to sync chat:", err);
        }

    },

    reset: () => {
        clearChatCache();
        set({
            conversations: [],
            selectedConversationId: null,
            selectedOtherUserId: null,
            messages: [],
            hasMoreMessages: true,
            typingUserId: null,
        });
    },

}));