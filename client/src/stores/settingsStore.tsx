import { create } from "zustand";

type settingsStoreProps = {
    dark: boolean; //theme
    changeTheme: () => void
}

export const useSettingsStore = create <settingsStoreProps> () ((set) => ({

    dark: false,

    changeTheme: () => { 
        
        set((state) => {

            const nextDarkValue = !state.dark;
            document.documentElement.classList.toggle("dark", nextDarkValue);
            return { dark: nextDarkValue };
            
        });
    },

}))