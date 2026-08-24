import { useEffect, useRef, useState } from "react";

import Avatar from "../UI/Avatar";
import TextBubble from "../UI/TextBubble";
import { TypingBubble } from "../UI/TextBubble";
import Button from "../UI/Button";

import { useChatStore } from "../../stores/chatStore";
import { useFriendsStore } from "../../stores/friendStore";
import { useAuthStore } from "../../stores/authStore";
import { usePresenceStore } from "../../stores/presenceStore";
import { subscribePresence, unsubscribePresence } from "../../socket";
import type { CachedMessage } from "../../chatDb";

//maps our internal message shape onto the four states TextBubble knows how to render
function getMessageStatus(message: CachedMessage): "sending" | "sent" | "received" | "read" | "failed" {
    if (message.status === "sending") return "sending";
    if (message.status === "failed") return "failed";
    if (message.is_read) return "read";
    if (message.is_received) return "received";
    return "sent";
}

function formatTime(isoString: string | null) {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

function CurrentChat(){

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [draft, setDraft] = useState("");

    const selectedConversationId = useChatStore((state) => state.selectedConversationId);
    const selectedOtherUserId = useChatStore((state) => state.selectedOtherUserId);
    const messages = useChatStore((state) => state.messages);
    const isLoadingMore = useChatStore((state) => state.isLoadingMore);
    const hasMoreMessages = useChatStore((state) => state.hasMoreMessages);
    const typingUserId = useChatStore((state) => state.typingUserId);
    const loadMoreMessages = useChatStore((state) => state.loadMoreMessages);
    const sendMessage = useChatStore((state) => state.sendMessage);
    const retryMessage = useChatStore((state) => state.retryMessage);
    const setTyping = useChatStore((state) => state.setTyping);

    const friends = useFriendsStore((state) => state.friends);
    const fetchFriends = useFriendsStore((state) => state.fetchFriends);
    const currentUserId = useAuthStore((state) => state.user.user_id);
    const presence = usePresenceStore((state) => state.statusMap);

    const friend = friends.find((f) => String(f.id) === String(selectedOtherUserId));
    const isOtherTyping = typingUserId === selectedOtherUserId;

    //watch presence for whoever this chat is open with
    useEffect(() => {
        if (!selectedOtherUserId) return;

        subscribePresence(selectedOtherUserId);
        return () => unsubscribePresence(selectedOtherUserId);
    }, [selectedOtherUserId]);

    useEffect(() => {
        if (friends.length === 0) fetchFriends();
    }, [fetchFriends]);

    //jump to the bottom whenever a new conversation is opened
    useEffect(() => {
        const el = scrollContainerRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [selectedConversationId]);

    //stay pinned to the bottom on new messages, but only if already near it, dont yank someone reading history
    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
        if (nearBottom) el.scrollTop = el.scrollHeight;
    }, [messages.length]);

    const handleInput = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
        setTyping();
    };

    const handleScroll = async () => {
        const el = scrollContainerRef.current;
        if (!el || isLoadingMore || !hasMoreMessages) return;

        if (el.scrollTop < 100) {
            const previousHeight = el.scrollHeight;
            await loadMoreMessages();
            //keep the viewport anchored on the same message after older ones are prepended above it
            requestAnimationFrame(() => {
                if (el) el.scrollTop = el.scrollHeight - previousHeight;
            });
        }
    };

    const handleSend = () => {
        if (!draft.trim()) return;
        sendMessage(draft);
        setDraft("");

        const el = textareaRef.current;
        if (el) el.style.height = "auto";
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!selectedConversationId) {
        return (
            <div className="
                bg-[var(--bg)]
                relative overflow-hidden
                flex items-center justify-center
                w-full md:flex-1 lg:w-[70%]
                h-full rounded-xl
                text-[var(--muted)] font-medium
            ">
                Select a chat to start messaging
            </div>
        );
    }

    return (

        <>

            <div className="
                bg-[var(--bg)]
                relative overflow-hidden
                flex flex-col
                w-full md:flex-1 lg:w-[70%]
                h-full rounded-xl 
            ">
                
                <div className="
                    bg-[var(--chat-header-mask)] backdrop-blur-sm
                    absolute
                    z-10
                    flex items-center
                    w-full h-16 lg:h-20
                    border-b border-[var(--border)]
                ">

                    <Avatar containerClassName="
                        mx-3 lg:mx-5
                    " onlineIndicatorClassName="
                        hidden
                    " imageClassName="
                        h-9 md:h-10 lg:h-14
                    " imageSrc={friend?.profile}/>

                    <div>

                        <p className="
                            text-[var(--text)]
                            text-sm lg:text-xl 
                            font-semibold
                            md:leading-5
                        ">{friend?.name ?? "Unknown"}</p>

                        <p className="
                            text-[var(--accent)]
                            text-xs lg:text-base 
                            font-medium
                            md:leading-4
                        ">{presence[String(selectedOtherUserId ?? "")] === "online" ? "online" : "offline"}</p>

                    </div>

                </div>

                <div ref={scrollContainerRef} onScroll={handleScroll} className="
                    overflow-y-auto scrollbar-light dark:scrollbar-dark
                    w-full flex-1
                    p-1 md:p-3 lg:p-5
                ">

                    <div className="
                        w-full pt-20 md:pt-[85px] pb-20
                    ">

                        {messages.map((message, index) => {

                            const isMe = message.sender_id === String(currentUserId);
                            const nextMessage = messages[index + 1];
                            const isLast = !nextMessage || nextMessage.sender_id !== message.sender_id;
                            const status = isMe ? getMessageStatus(message) : undefined;

                            return (
                                <TextBubble
                                    key={message.client_id}
                                    imageSrc={friend?.profile}
                                    isMe={isMe}
                                    isLast={isLast}
                                    textContent={message.message}
                                    time={formatTime(message.created_at)}
                                    status={status}
                                    onClick={status === "failed" ? () => retryMessage(message.client_id) : undefined}
                                />
                            );

                        })}

                        {isOtherTyping && <TypingBubble imageSrc={friend?.profile}/>}

                    </div>

                </div>

                <div className="
                    absolute bottom-0
                    z-10
                    flex items-center justify-center
                    w-full p-2 md:p-5
                "
                style={{ background: "var(--chat-bottom-mask)" }}
                >

                    <div className="
                        flex items-center overflow-hidden
                        w-[80%] md:w-[70%]
                    ">

                        <div className="
                            bg-[var(--form-bg)]
                            flex items-center
                            flex-1 
                            py-2 mr-2 md:mr-4 
                            border border-[var(--border)] rounded-[7px]
                        ">

                            <textarea className="
                                text-[var(--text)] font-medium
                                text-xs lg:text-base
                                placeholder:font-medium
                                placeholder-[var(--muted)] 
                                placeholder:text-xs lg:placeholder:text-base
                                max-h-28 w-full
                                resize-none overflow-y-auto
                                scrollbar-light dark:scrollbar-dark
                                outline-none
                                px-3
                                bg-transparent
                            "   
                                placeholder="Type a message"
                                ref={textareaRef}
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onInput={handleInput}
                                onKeyDown={handleKeyDown}
                                rows={1}
                            />

                        </div>

                        <Button className="
                            bg-[var(--cta-bg)]
                            h-[33px] md:h-[35px] lg:h-[40px] w-[33px] md:w-[35px] lg:w-[40px]
                            rounded-[7px]
                            pl-[2px]
                        "
                            onClick={handleSend}
                        >

                            <svg className="
                                size-4 lg:size-5 text-[var(--cta-text)]
                            "
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" viewBox="0 0 24 24" 
                                stroke-width="2" 
                                stroke="currentColor" 
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>

                        </Button>

                    </div>

                </div>

            </div>

        </>

    );

}

export default CurrentChat;