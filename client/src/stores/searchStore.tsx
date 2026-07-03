import { create } from "zustand";
import { getUsers } from "../services/userService";

// Capitalize type definitions for consistency
type User = {
    id: string;
    name: string;
    username: string;
    profile: string;
    bio: string;
}

type SearchStoreProps = {
    searchUserQuery: string;
    searchUserResults: Array<User>;
    setSearchQuery: (query: string) => void;
    clearSearch: () => void;
    searchUser: (query: string) => Promise<void>;
}

export const useSearchStore = create<SearchStoreProps>()((set) => ({

    searchUserQuery: "",

    searchUserResults: [],

    // Action to quickly update the input element string value
    setSearchQuery: (query) => set({ searchUserQuery: query }),

    // Reset helper
    clearSearch: () => set({ searchUserQuery: "", searchUserResults: [] }),

    searchUser: async (query) => {
        try {
            const response = await getUsers(query);
            
            // Fixed: Enclosed the key-value update inside a proper object wrapper
            set({ searchUserResults: response.data.payload || [] });
        } catch (error) {
            console.error("Error fetching users:", error);
            set({ searchUserResults: [] });
        }
    },

}));