// stores/toastStore.ts
import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info" | "default";

export type ToastItem = {
    id: string;
    variant: ToastVariant;
    title?: string;
    message: string;
    duration: number; //ms visible before auto dismiss
    status: "active" | "exiting"; //exiting just flags intent, removal happens after the exit animation finishes
};

type AddToastInput = {
    variant?: ToastVariant;
    title?: string;
    message: string;
    duration?: number;
};

type ToastStore = {
    toasts: ToastItem[];
    addToast: (input: AddToastInput) => string;
    startExit: (id: string) => void;
    removeToast: (id: string) => void; //hard remove, called by Toast once its exit animation completes
};

const MAX_VISIBLE_TOASTS = 3;

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],

    addToast: (input) => {
        const id = crypto.randomUUID();

        const newToast: ToastItem = {
            id,
            variant: input.variant ?? "default",
            title: input.title,
            message: input.message,
            duration: input.duration ?? 4000,
            status: "active",
        };

        set((state) => {
            const active = state.toasts.filter((t) => t.status === "active");

            // stack is full, force the oldest active one to start exiting now
            // regardless of how much of its timer is left
            if (active.length >= MAX_VISIBLE_TOASTS) {
                const oldest = active[active.length - 1];
                return {
                    toasts: [
                        newToast,
                        ...state.toasts.map((t) =>
                            t.id === oldest.id ? { ...t, status: "exiting" as const } : t
                        ),
                    ],
                };
            }

            return { toasts: [newToast, ...state.toasts] };
        });

        return id;
    },

    startExit: (id) => {
        set((state) => ({
            toasts: state.toasts.map((t) =>
                t.id === id ? { ...t, status: "exiting" as const } : t
            ),
        }));
    },

    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },
}));