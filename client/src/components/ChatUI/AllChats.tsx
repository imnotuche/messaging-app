import { useEffect, useState } from "react";
import Avatar from "../UI/Avatar";
import Button from "../UI/Button";
import { useChatStore } from "../../stores/chatStore";
import { useFriendsStore } from "../../stores/friendStore";

//formats an iso timestamp into 24h clock time
function formatTime(isoString: string | null) {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

function AllChats(){

    const [chatListExpand, setChatListExpand] = useState (false);
    const [chatListVisible, setChatListVisible] = useState (false)

    const conversations = useChatStore((state) => state.conversations);
    const fetchConversations = useChatStore((state) => state.fetchConversations);
    const selectConversation = useChatStore((state) => state.selectConversation);
    const restoreLastConversation = useChatStore((state) => state.restoreLastConversation);
    const selectedConversationId = useChatStore((state) => state.selectedConversationId);
    const friends = useFriendsStore((state) => state.friends);
    const fetchFriends = useFriendsStore((state) => state.fetchFriends);

    useEffect(() => {
        fetchConversations();
        if (friends.length === 0) fetchFriends();
        restoreLastConversation();
    }, [fetchConversations, fetchFriends, restoreLastConversation]);

    return (

        <>

            <div className={`
                bg-[var(--bg)] shadow-[0_8px_32px_rgba(15,23,42,0.06)]
                absolute md:relative z-10 md:z-0
                right-3 md:right-0 bottom-1/2 md:bottom-0
                translate-y-1/2 md:translate-y-0 md:translate-x-0
                flex flex-col items-center
                h-[85%] md:h-full w-[80%] lg:w-[30%]
                rounded-xl border border-[var(--border)] md:border-none
                md:ml-3
                transition-all duration-300 ease
                ${chatListExpand ? 'md:w-[35%]' : 'md:w-[10%]'}
                ${chatListVisible ? 'translate-x-0' : 'translate-x-[calc(100%+10px)]'}
            `}>

                <div className={`
                    bg-[var(--chat-header-mask)] backdrop-blur-sm
                    absolute top-0
                    flex items-center lg:justify-start
                    w-full h-14 md:h-16
                    rounded-t-xl 
                    border-b border-[var(--border)]
                    md:text-lg lg:text-xl font-semibold
                    ${chatListExpand ? 'md:justify-start' : 'md:justify-center'}
                `}>

                    <Button className={`
                        bg-[var(--text)]
                        absolute
                        flex md:hidden
                        -translate-x-full md:translate-x-0
                        justify-center items-center
                        w-6 h-8
                        rounded-r-none rounded-l-xl
                    `}
                        onClick={() => {
                            setChatListVisible(p => !p)
                        }}
                    >
                        <svg className={`
                            size-4 text-[var(--bg)] 
                            transition-all duration-300 ease
                            ${chatListVisible ? '' : 'rotate-180'}
                        `}
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke-width="3" 
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>

                    </Button> 

                    <Button className={`
                        bg-transparent
                        hidden md:flex lg:hidden 
                        justify-center items-center
                        w-10 h-10
                        rounded-full shrink-0
                    `}
                        onClick={() => {
                            setChatListExpand(p => !p);
                        }}
                    >
                        <svg className={`
                            size-4 text-[var(--text)] 
                            transition-all duration-300 ease
                            ${chatListExpand ? '' : 'rotate-180'}
                        `}
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke-width="3" 
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>

                    </Button>  

                    <p className={`
                        lg:block text-[var(--text)]
                        ml-4 md:ml-2 lg:ml-8
                        lg:translate-x-0 lg:opacity-100
                        transition-all duration-300 ease
                        ${chatListExpand ? 'translate-x-0 md:block': 
                            'md:translate-x-[500px] md:opacity-0 md:hidden'}
                    `}>Chats</p>

                </div>

                <div className="
                    flex-1 w-full
                    overflow-y-scroll
                    scrollbar-light
                    my-12 md:my-16 p-3
                ">

                    {conversations.map((conversation) => {

                        const friend = friends.find((f) => String(f.id) === String(conversation.other_user_id));
                        const isSelected = conversation.conversation_id === selectedConversationId;

                        return (

                            <div key={conversation.conversation_id}
                                className={`
                                    flex items-center cursor-pointer
                                    w-[100%] h-16 
                                    md:mb-0 lg:mb-3
                                    ${chatListExpand ? '' : 'md:justify-center'}
                                    ${isSelected ? 'bg-[var(--form-bg)] rounded-lg' : ''}
                                `}
                                onClick={() => {
                                    selectConversation(conversation.conversation_id, String(conversation.other_user_id));
                                    setChatListVisible(false);
                                }}
                            >

                                <Avatar imageClassName="
                                    h-9 md:h-10 lg:h-12
                                " imageSrc={friend?.profile}/>

                                <div className={`
                                    block lg:block 
                                    opacity-100 lg:opacity-100
                                    translate-x-0 lg:translate-x-0
                                    flex-1 min-w-0 ml-2
                                    ${chatListExpand ? 'md:translate-x-0 opacity-100 md:block': 'md:translate-x-[500px] opacity-0 md:hidden'}
                                `}>

                                    <p className="
                                        text-sm md:text-m 
                                        font-semibold text-[var(--text)]
                                        truncate
                                        leading-5
                                        mb-[2px]
                                    ">{friend?.name ?? "Unknown"}</p>

                                    <p className="
                                        text-xs lg:text-sm 
                                        font-medium text-[var(--muted)]
                                        truncate
                                        leading-5
                                    ">
                                        {conversation.last_message ?? "Say hello"}
                                    </p>

                                </div>

                                <div className={`
                                    flex lg:flex
                                    flex-col shrink-0 items-end 
                                    opacity-100 lg:opacity-100
                                    translate-x-0 lg:translate-x-0
                                    ${chatListExpand ? 'md:translate-x-0 opacity-100 md:flex': 'md:translate-x-[500px] opacity-0 md:hidden'}
                                `}>
                                    <p className="
                                        text-xs lg:text-sm 
                                        font-semibold text-[var(--muted)]
                                    ">{formatTime(conversation.last_message_time)}</p>

                                    {conversation.unread_count > 0 && (
                                        <div className="
                                            bg-[var(--text)]
                                            flex justify-center items-center
                                            h-5 lg:h-6 aspect-square
                                            pb-[2px] my-[2px]
                                            rounded-full
                                            text-xs lg:text-sm 
                                            font-semibold text-[var(--bg)]
                                        ">{conversation.unread_count}</div>
                                    )}

                                </div>

                            </div>

                        );

                    })}

                </div>

                <div className="
                    absolute bottom-0
                    flex items-center
                    rounded-b-xl 
                    w-full h-12
                "
                style={{ background: "var(--chat-bottom-mask)" }}
                ></div>

            </div>

        </>

    );

}

export default AllChats;