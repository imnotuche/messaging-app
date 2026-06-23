import { create } from "zustand";

type settingsStoreProps = {
    dark: boolean; //theme
    changeTheme: () => void
}

export const useSettingsStore = create <settingsStoreProps> () ((set) => ({

    // Directly detects the presence of the dark class on initialize
    dark: document.documentElement.classList.contains("dark"),

    changeTheme: () => { 
        
        set((state) => {

            const nextDarkValue = !state.dark;
            document.documentElement.classList.toggle("dark", nextDarkValue);
            return { dark: nextDarkValue };
            
        });
    },

}))