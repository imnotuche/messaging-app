import { create } from "zustand";

type settingsStoreProps = {
    dark: boolean; //theme
    changeTheme: () => void
}

const getInitialTheme = (): boolean => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

export const useSettingsStore = create<settingsStoreProps>()((set) => ({
    dark: getInitialTheme(),
    changeTheme: () => { 
        
        set((state) => {
            const nextDarkValue = !state.dark;
            document.documentElement.classList.toggle("dark", nextDarkValue);
            localStorage.setItem("theme", nextDarkValue ? "dark" : "light");
            return { dark: nextDarkValue };
            
        });
    },
}))