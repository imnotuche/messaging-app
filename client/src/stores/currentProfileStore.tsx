import { create } from "zustand";
import { getUser } from "../services/userService";

type UserProfileData = {
    id: string;
    name: string;
    username: string;
    email: string;
    bio: string;
    profile: string;
    isOnline: boolean;
    lastSeen: string;
    mutualFriendsCount: number;
};

type FriendshipStatus = "none" | "pending" | "friends" | "blocked";

type ProfileState = {
    user: UserProfileData | null;
    friendshipStatus: FriendshipStatus;
    isLoading: boolean;
    setProfileData: (query: string) => Promise<void>;
    clearProfileData: () => void;
}

export const useCurrentProfileStore = create<ProfileState>((set) => ({

    user: null,
    friendshipStatus: "none",
    isLoading: false,

    setProfileData: async (query: string) => {

        set({ isLoading: true });

        try {
            const response = await getUser(query);
            console.log(response)
            set({user : response.data.payload})
        } catch (error) {
            console.error("Failed to fetch connection status in profileStore:", error);
            set({ user: null });
        } finally {
            set({ isLoading: false });
        }
    },

    clearProfileData: () => {
        set({ user: null, friendshipStatus: "none" });
    }
    
}));