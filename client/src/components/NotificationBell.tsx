import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificationStore, type NotificationItem, type NotificationType } from "../stores/notificationStore";

const BellIcon = () => (

    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>

);

//per-type display text, actor name comes from the denormalized payload snapshot, not a live lookup
const notificationMessages: Record<NotificationType, (n: NotificationItem) => string> = {
    friend_request: (n) => `${n.payload?.name || "Someone"} sent you a friend request`,
    friend_accept: (n) => `${n.payload?.name || "Someone"} accepted your friend request`,
};

//per-type click destination, add a line here whenever a new notification type is introduced
const notificationRoutes: Record<NotificationType, (n: NotificationItem) => string> = {
    friend_request: (n) => `/friends/${n.actor_id}`,
    friend_accept: (n) => `/friends/${n.actor_id}`,
};

//minute-accurate relative time, sqlite CURRENT_TIMESTAMP is utc with no offset marker,
//so we append Z ourselves or new Date() parses it as local time and drifts.
//each tier also reports how long until its own label would next change, so the
//caller only needs to recheck as often as the freshest visible item requires
type RelativeTime = { label: string; nextCheckMs: number };

function getRelativeTime(dateString: string): RelativeTime {

    const utcString = dateString.includes("Z") ? dateString : `${dateString}Z`;
    const then = new Date(utcString).getTime();
    const diffMs = Date.now() - then;
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return { label: "just now", nextCheckMs: 30_000 };
    if (diffMinutes < 60) return { label: `${diffMinutes}m ago`, nextCheckMs: 30_000 };

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return { label: `${diffHours}h ago`, nextCheckMs: 5 * 60_000 };

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return { label: `${diffDays}d ago`, nextCheckMs: 60 * 60_000 };

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return { label: `${diffWeeks}w ago`, nextCheckMs: 24 * 60 * 60_000 };

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return { label: `${diffMonths}mo ago`, nextCheckMs: 24 * 60 * 60_000 };

    const diffYears = Math.floor(diffDays / 365);
    return { label: `${diffYears}y ago`, nextCheckMs: 24 * 60 * 60_000 };

}

//how long the dropdown has to stay open before the visible batch gets marked read
const BATCH_READ_DELAY_MS = 1500;
const VISIBLE_COUNT = 5;

function NotificationBell() {

    const navigate = useNavigate();
    const notificationStore = useNotificationStore();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [, forceTick] = useState(0); //unused value, just needed to trigger a re-render on schedule
    const wrapperRef = useRef<HTMLDivElement>(null);
    const batchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        notificationStore.fetchInitial();
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    //debounced batch read, cancels if the dropdown closes before the delay finishes
    useEffect(() => {

        if (!dropdownOpen) {
            if (batchTimeoutRef.current) clearTimeout(batchTimeoutRef.current);
            return;
        }

        const visibleIds = notificationStore.items.slice(0, VISIBLE_COUNT).map((n) => n.id);

        batchTimeoutRef.current = setTimeout(() => {
            notificationStore.markBatchRead(visibleIds);
        }, BATCH_READ_DELAY_MS);

        return () => {
            if (batchTimeoutRef.current) clearTimeout(batchTimeoutRef.current);
        };

    }, [dropdownOpen]);

    //adaptive timestamp refresh, only checks as often as the freshest visible item needs,
    //reschedules whenever items change so a brand new push snaps the interval back down
    useEffect(() => {

        if (!dropdownOpen) return;

        let timeoutId: ReturnType<typeof setTimeout>;

        const scheduleNext = () => {

            const visible = notificationStore.items.slice(0, VISIBLE_COUNT);
            if (visible.length === 0) return;

            const nextCheckMs = Math.min(...visible.map((n) => getRelativeTime(n.created_at).nextCheckMs));

            timeoutId = setTimeout(() => {
                forceTick((t) => t + 1);
                scheduleNext();
            }, nextCheckMs);

        };

        scheduleNext();

        return () => clearTimeout(timeoutId);

    }, [dropdownOpen, notificationStore.items]);

    const handleNotificationClick = (n: NotificationItem) => {
        notificationStore.markRead(n.id);
        setDropdownOpen(false);
        navigate(notificationRoutes[n.type](n));
    };

    //99+ cap, anything higher just clutters the badge
    const displayCount = notificationStore.unreadCount > 99 ? "99+" : notificationStore.unreadCount;

    const dropdownBody = (
        <>
            <div className="
                px-4 py-3 border-b border-[var(--border)]
                text-sm font-semibold text-[var(--text)]
            ">Notifications</div>

            {notificationStore.isLoading && notificationStore.items.length === 0 && (
                <div className="px-4 py-6 text-xs text-[var(--muted)] text-center">Loading...</div>
            )}

            {!notificationStore.isLoading && notificationStore.items.length === 0 && (
                <div className="px-4 py-6 text-xs text-[var(--muted)] text-center">Nothing here yet</div>
            )}

            {notificationStore.items.slice(0, VISIBLE_COUNT).map((n) => (
                <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`
                        flex items-start gap-2.5
                        px-4 py-3
                        cursor-pointer
                        hover:bg-[var(--input-bg)]
                        border-b border-[var(--border)] last:border-b-0
                        ${n.is_read ? '' : 'bg-[var(--accent-lo)]'}
                    `}
                >
                    <div className={`
                        mt-1.5 shrink-0
                        w-1.5 h-1.5 rounded-full
                        ${n.is_read ? 'bg-transparent' : 'bg-[var(--accent)]'}
                    `} />
                    <div className="min-w-0 flex-1">
                        <div className="text-xs text-[var(--text)] leading-relaxed">
                            {notificationMessages[n.type](n)}
                        </div>
                        <div className="text-[10px] text-[var(--dim)] mt-0.5">
                            {getRelativeTime(n.created_at).label}
                        </div>
                    </div>
                </div>
            ))}

            {notificationStore.items.length > VISIBLE_COUNT && (
                <button
                    type="button"
                    onClick={() => notificationStore.fetchMore()}
                    disabled={notificationStore.isLoadingMore}
                    className="
                        w-full px-4 py-2.5
                        text-xs font-semibold text-[var(--accent)]
                        hover:bg-[var(--input-bg)]
                        cursor-pointer disabled:opacity-60
                    "
                >
                    {notificationStore.isLoadingMore ? "Loading..." : "View more"}
                </button>
            )}
        </>
    );

    return (

        <div ref={wrapperRef}>

            {/*desktop/tablet: straddles AllChats's real top-right corner (12px margin, rounded-xl radius)*/}
            <div className="
                hidden md:flex
                absolute top-6 right-6 z-50
                -translate-y-1/2 translate-x-1/2
            ">

                <button
                    type="button"
                    onClick={() => setDropdownOpen(p => !p)}
                    className="
                        relative flex justify-center items-center
                        w-10 h-10
                        rounded-2xl
                        bg-[var(--panel-bg)]
                        shadow-[var(--card-shadow)]
                        text-[var(--panel-sub)] hover:text-[var(--panel-text)]
                        transition-colors cursor-pointer
                    "
                >
                    <span className="size-6"><BellIcon /></span>

                    {notificationStore.unreadCount > 0 && (
                        <span className="
                            absolute -top-0.5 -right-0.5
                            flex justify-center items-center
                            min-w-[16px] h-[16px] px-1
                            rounded-full
                            bg-red-500 text-white
                            text-[10px] font-semibold
                        ">{displayCount}</span>
                    )}
                </button>

                {dropdownOpen && (
                    <div className="
                        absolute top-12 right-0
                        w-[280px] max-h-[360px] overflow-y-auto
                        rounded-lg border border-[var(--border)]
                        bg-[var(--form-bg)] shadow-[var(--card-shadow)]
                    ">
                        {dropdownBody}
                    </div>
                )}

            </div>

            {/*mobile: no stable AllChats corner to slice, plain floating pill instead*/}
            <div className="md:hidden fixed top-1 right-1 z-50">

                <button
                    type="button"
                    onClick={() => setDropdownOpen(p => !p)}
                    className="
                        relative flex justify-center items-center
                        w-10 h-10
                        rounded-xl
                        bg-[var(--panel-bg)]
                        shadow-[var(--card-shadow)]
                        text-[var(--panel-sub)] hover:text-[var(--panel-text)]
                        transition-colors cursor-pointer
                    "
                >
                    <span className="size-6"><BellIcon /></span>

                    {notificationStore.unreadCount > 0 && (
                        <span className="
                            absolute -top-0.5 -right-0.5
                            flex justify-center items-center
                            min-w-[14px] h-[14px] px-1
                            rounded-full
                            bg-red-500 text-white
                            text-[9px] font-semibold
                        ">{displayCount}</span>
                    )}
                </button>

                {dropdownOpen && (
                    <div className="
                        absolute top-12 right-0
                        w-[240px] max-h-[320px] overflow-y-auto
                        rounded-lg border border-[var(--border)]
                        bg-[var(--form-bg)] shadow-[var(--card-shadow)]
                    ">
                        {dropdownBody}
                    </div>
                )}

            </div>

        </div>

    );

}

export default NotificationBell;