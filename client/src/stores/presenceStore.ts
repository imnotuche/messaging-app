//import modules
import { create } from "zustand";

type PresenceState = {
    statusMap: Record<string, "online" | "offline">;
    setStatus: (userId: string, status: "online" | "offline") => void;
};

export const usePresenceStore = create<PresenceState>((set) => ({
    statusMap: {},

    //called internally by the socket listener, not meant to be called from components
    setStatus: (userId, status) =>
        set((state) => ({
            statusMap: { ...state.statusMap, [userId]: status }
        }))
}));