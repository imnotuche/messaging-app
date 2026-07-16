//import modules
import { io, Socket } from "socket.io-client";
import { usePresenceStore } from "./stores/presenceStore";

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

    //keep the redis ttl alive, matches the 10s interval from your plan
    socket.on("connect", () => {
        heartbeatInterval = setInterval(() => {
            socket?.emit("heartbeat");
        }, 10000);
    });

    //clear the interval if the socket drops, restart handled on reconnect
    socket.on("disconnect", () => {
        if (heartbeatInterval) clearInterval(heartbeatInterval);
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