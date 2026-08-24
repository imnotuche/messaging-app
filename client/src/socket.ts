//import modules
import { io, Socket } from "socket.io-client";
import { usePresenceStore } from "./stores/presenceStore";
import { useNotificationStore } from "./stores/notificationStore";
import { useChatStore } from "./stores/chatStore";

//singleton instance, created once, reused everywhere
let socket: Socket | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

//call this once on app mount, not per component
export function connectSocket() {
    if (socket) return socket; //already connected, dont duplicate

    socket = io(import.meta.env.VITE_API_URL_LOCAL, {
        withCredentials: true //required, jwt lives in the cookie
    });

    //server rejected the connection, no valid cookie
    socket.on("connect_error", (err) => {
        console.log(`socket connect error: ${err.message}   source:socket.ts`);
    });

    //single listener for the whole app, writes straight into the store
    socket.on("presence_change", (data: { user_id: string; status: "online" | "offline" }) => {
        usePresenceStore.getState().setStatus(data.user_id, data.status);
    });

    //fresh notification pushed from the backend, store handles the prepend + unread bump
    socket.on("new_notification", (data) => {
        useNotificationStore.getState().addNotification(data);
    });

    //keep the redis ttl alive, matches the 10s interval from your plan
    socket.on("connect", () => {
        heartbeatInterval = setInterval(() => {
            socket?.emit("heartbeat");
        }, 10000);
    });

    //rooms dont persist across a reconnect, rejoin whatever chat screen is currently open then catch up
    socket.on("connect", () => {
        const { selectedConversationId } = useChatStore.getState();
        if (selectedConversationId) {
            socket?.emit("join_conversation", { conversation_id: selectedConversationId });
        }
        useChatStore.getState().syncOnReconnect();
    });

    //clear the interval if the socket drops, restart handled on reconnect
    socket.on("disconnect", () => {
        if (heartbeatInterval) clearInterval(heartbeatInterval);
    });

        //fresh message, either a live push to an open conversation or the sender's own echo
    socket.on("new_message", (data) => {
        useChatStore.getState().handleNewMessage(data);
    });

    //ack for a message this client just sent, reconciles the optimistic row
    socket.on("message_sent", (data: { client_id: string; message: any }) => {
        useChatStore.getState().handleMessageSent(data.client_id, data.message);
    });

    socket.on("message_failed", (data: { client_id: string; reason: string }) => {
        console.log(`message failed to send: ${data.reason}   source:socket.ts`);
        useChatStore.getState().handleMessageFailed(data.client_id);
    });

    //list-screen nudge, refetches just that conversation's summary
    socket.on("conversation_update", (data: { conversation_id: number }) => {
        useChatStore.getState().handleConversationUpdate(data.conversation_id);
    });

    socket.on("message_status", (data: { message_id: number; status: "received" }) => {
        useChatStore.getState().handleMessageStatus(data.message_id, data.status);
    });

    socket.on("message_read", (data: { message_ids: number[]; reader_id: string }) => {
        useChatStore.getState().handleMessageRead(data.message_ids);
    });

    socket.on("typing_start", (data: { user_id: string }) => {
        useChatStore.getState().handleTypingStart(data.user_id);
    });

    socket.on("typing_stop", (data: { user_id: string }) => {
        useChatStore.getState().handleTypingStop(data.user_id);
    });

    return socket;
}

//used by components to subscribe/unsubscribe without importing socket.io-client directly everywhere
export function getSocket() {
    return socket;
}

//call when a profile/chat is opened, lives here now, not in the store, it doesnt hold state
export function subscribePresence(userId: string) {
    socket?.emit("subscribe_presence", { target_user_id: userId });
}

//call when a profile/chat is closed
export function unsubscribePresence(userId: string) {
    socket?.emit("unsubscribe_presence", { target_user_id: userId });
}

export function disconnectSocket() {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    socket?.disconnect();
    socket = null;
}