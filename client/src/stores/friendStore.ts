import { create } from "zustand";
import { getFriends, searchFriends, unfriend } from "../services/friendService";
import { useAuthStore } from "./authStore";

// Capitalize type definitions for consistency
type Friend = {
    id: string;
    name: string;
    email: string;
    username: string;
    profile: string;
    bio: string;
    last_seen: string;
}

type FriendsStoreProps = {
    friends: Array<Friend>;
    searchQuery: string;
    searchResults: Array<Friend>;
    isSearching: boolean;
    isLoading: boolean;
    debounceTimer: ReturnType<typeof setTimeout> | null;
    fetchFriends: () => Promise<void>;
    setSearchQuery: (query: string) => void;
    clearSearch: () => void;
    removeFriend: (friendId: string) => Promise<void>;
    syncRemoveFriend: (friendId: string) => void;
    syncAddFriend: (friend: Friend) => void;
}

export const useFriendsStore = create<FriendsStoreProps>()((set, get) => ({
    friends: [],
    searchQuery: "",
    searchResults: [],
    isSearching: false,
    isLoading: false,
    debounceTimer: null,

    // Fetch the full friends list on mount
    fetchFriends: async () => {
        set({ isLoading: true });
        try {
            const response = await getFriends();
            set({ friends: response.data.friends || [] });
        } catch (error) {
            console.error("Error fetching friends:", error);
            set({ friends: [] });
        } finally {
            set({ isLoading: false });
        }
    },

    // Action to quickly update the input element string value, debounced before hitting the db
    setSearchQuery: (query) => {
        set({ searchQuery: query });

        const existingTimer = get().debounceTimer;
        if (existingTimer) clearTimeout(existingTimer);

        if (!query.trim()) {
            set({ searchResults: [], isSearching: false, debounceTimer: null });
            return;
        }

        const timer = setTimeout(async () => {
            set({ isSearching: true });
            try {
                const response = await searchFriends(query);
                set({ searchResults: response.data.friends || [] });
            } catch (error) {
                console.error("Error searching friends:", error);
                set({ searchResults: [] });
            } finally {
                set({ isSearching: false });
            }
        }, 350);

        set({ debounceTimer: timer });
    },

    // Reset helper
    clearSearch: () => set({ searchQuery: "", searchResults: [] }),

    // Full unfriend action, this is the only store that owns this network call
    // used directly by the remove button inside the AllFriends list
    removeFriend: async (friendId) => {
        const auth = useAuthStore.getState();
        try {
            await unfriend(auth.user.user_id, friendId);
            get().syncRemoveFriend(friendId);
        } catch (error) {
            console.error("Error removing friend:", error);
        }
    },

    // State-only removal, no network call
    // called by currentProfileStore after ITS OWN unfriend service call succeeds
    // so we don't fire a second request for the same action
    syncRemoveFriend: (friendId) => {
        set((state) => ({
            friends: state.friends.filter((f) => f.id !== friendId),
            searchResults: state.searchResults.filter((f) => f.id !== friendId),
        }));
    },

    // State-only addition, no network call
    // called by currentProfileStore after accepting a friend request succeeds
    syncAddFriend: (friend) => {
        set((state) => {
            //avoid duplicate entries if they're somehow already in the list
            if (state.friends.some((f) => f.id === friend.id)) return state;
            return { friends: [...state.friends, friend] };
        });
    },
}));