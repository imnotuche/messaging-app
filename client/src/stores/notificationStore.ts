import { create } from "zustand";
import { getNotifications, markNotificationRead, markNotificationsReadBatch } from "../services/notificationService";

export type NotificationType = "friend_request" | "friend_accept";

export type NotificationItem = {
    id: number;
    recipient_id: number;
    actor_id: number;
    type: NotificationType;
    payload: { name?: string; username?: string; profile?: string } | null;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
};

type NotificationState = {
    items: NotificationItem[];
    unreadCount: number;
    hasMore: boolean;
    isLoading: boolean;
    isLoadingMore: boolean;
    fetchInitial: () => Promise<void>;
    fetchMore: () => Promise<void>;
    addNotification: (notification: NotificationItem) => void; //called from the socket listener
    markRead: (id: number) => Promise<void>;
    markBatchRead: (ids: number[]) => Promise<void>;
    reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({

    items: [],
    unreadCount: 0,
    hasMore: true,
    isLoading: false,
    isLoadingMore: false,

    fetchInitial: async () => {

        set({ isLoading: true });

        try {

            const response = await getNotifications();
            const items: NotificationItem[] = response.data.items;

            set({
                items,
                unreadCount: response.data.unread_count,
                hasMore: items.length === 10, //full page means theres probably more
            });

        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            set({ isLoading: false });
        }

    },

    fetchMore: async () => {

        const { items, hasMore, isLoadingMore } = get();
        if (!hasMore || isLoadingMore || items.length === 0) return;

        set({ isLoadingMore: true });

        try {

            const oldest = items[items.length - 1];
            const response = await getNotifications(oldest.created_at, oldest.id);
            const newItems: NotificationItem[] = response.data.items;

            set({
                items: [...items, ...newItems],
                hasMore: newItems.length === 10,
            });

        } catch (err) {
            console.error("Failed to fetch more notifications:", err);
        } finally {
            set({ isLoadingMore: false });
        }

    },

    //fired by the socket listener on a fresh push, prepend and bump unread count locally
    addNotification: (notification) => {

        set((state) => ({
            items: [notification, ...state.items],
            unreadCount: state.unreadCount + 1,
        }));

    },

    markRead: async (id) => {

        const target = get().items.find((n) => n.id === id);
        if (!target || target.is_read) return; //already read, dont double decrement

        //optimistic update, dont wait on the network to reflect it locally
        set((state) => ({
            items: state.items.map((n) => n.id === id ? { ...n, is_read: true } : n),
            unreadCount: Math.max(0, state.unreadCount - 1),
        }));

        try {
            await markNotificationRead(id);
        } catch (err) {
            console.error("Failed to mark notification read:", err);
        }

    },

    markBatchRead: async (ids) => {

        const unreadIds = ids.filter((id) => {
            const item = get().items.find((n) => n.id === id);
            return item && !item.is_read;
        });

        if (unreadIds.length === 0) return;

        //optimistic update, same reasoning as markRead
        set((state) => ({
            items: state.items.map((n) => unreadIds.includes(n.id) ? { ...n, is_read: true } : n),
            unreadCount: Math.max(0, state.unreadCount - unreadIds.length),
        }));

        try {
            await markNotificationsReadBatch(unreadIds);
        } catch (err) {
            console.error("Failed to mark notifications read in batch:", err);
        }

    },

    reset: () => {
        set({ items: [], unreadCount: 0, hasMore: true, isLoading: false, isLoadingMore: false });
    },

}));