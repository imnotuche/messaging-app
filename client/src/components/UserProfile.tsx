import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Avatar from "./UI/Avatar";
import Button from "./UI/Button"; 
import { useCurrentProfileStore } from "../stores/currentProfileStore";
export default function UserProfile() {
    const { id } = useParams<{ id: string }>();
    
    const currentProfile =  useCurrentProfileStore();
    const [isFetchingUser, setIsFetchingUser] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    useEffect(() => {
        if (!id) return;
        const fetchUserProfileContext = async () => {
            setIsFetchingUser(true);
            setFetchError(null);
            try {
                await currentProfile.setProfileData(id);
            } catch (error) {
                console.error(error);
                setFetchError("An error occurred while fetching profile data.");
                currentProfile.clearProfileData();
            } finally {
                setIsFetchingUser(false);
            }
        };
        fetchUserProfileContext();
        return () => {
            currentProfile.clearProfileData();
        };
    }, [id, currentProfile.setProfileData, currentProfile.clearProfileData]);
    if (isFetchingUser) {
        return (
            <div className="
                bg-[var(--bg)]
                flex flex-1 
                items-center justify-center 
                text-sm text-[var(--muted)] 
                m-3 mb-0 lg:mb-3 rounded-xl
            ">
                Loading profile data...
            </div>
        );
    }
    if (fetchError || !id || !currentProfile.user) {
        return (
            <div className="
                bg-[var(--bg)]
                flex flex-1 
                items-center justify-center 
                text-sm text-[var(--muted)] 
                m-3 mb-0 lg:mb-3 rounded-xl
            ">
                {fetchError || "User profile data could not be discovered."}
            </div>
        );
    }
    const isBlockedByMe = currentProfile.friendshipStatus === "blocked_by_me";
    const isBlockedByThem = currentProfile.friendshipStatus === "blocked_by_them";
    const isFriend = currentProfile.friendshipStatus === "friends";
    return (
        <>
            <div className="
                bg-[var(--bg)] relative overflow-hidden 
                flex flex-col 
                w-full flex-1 
                m-2.5 md:m-3 mb-0 md:mb-0 lg:mb-3 lg:ml-0 
                rounded-xl
            ">
                
                <div className="
                    bg-[var(--chat-header-mask)] backdrop-blur-sm 
                    absolute z-10 
                    flex items-center justify-between 
                    w-full h-16 lg:h-20 px-4 lg:px-6 
                    border-b border-[var(--border)]
                ">
                    <h1 className="
                        font-sans text-base lg:text-lg font-semibold tracking-[-0.01em] 
                        text-[var(--text)]
                    ">
                        User Profile
                    </h1>
                </div>
                <div className="
                    flex-1 overflow-y-auto 
                    scrollbar-light dark:scrollbar-dark 
                    px-4 lg:px-8 pt-20 lg:pt-28 pb-12
                ">
                    <div className="
                        w-full max-w-[660px] mx-auto 
                        flex flex-col gap-5
                    ">
                        <div className="
                            relative overflow-hidden rounded-[20px] 
                            border border-[var(--card-border)] bg-[var(--form-bg)] 
                            shadow-[var(--card-shadow)] 
                            before:content-[''] before:block before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-blue-500/20 before:to-transparent
                        ">
                            <div className="
                                relative p-[22px] sm:p-7 md:p-[28px] md:px-[32px]
                            ">
                                <div className="
                                    flex flex-col
                                    gap-5
                                ">
                                    <div className="
                                        flex items-center gap-[22px]
                                    ">
                                        <div className="
                                            group relative shrink-0 overflow-hidden
                                        ">
                                            <Avatar 
                                                imageSrc={isBlockedByMe || isBlockedByThem ? "" : currentProfile.user.profile}
                                                imageClassName="w-16 h-16 md:w-20 md:h-20"
                                                onlineIndicatorClassName="hidden"
                                            />
                                        </div>
                                        
                                        <div className="
                                            flex-1 min-w-0
                                        ">
                                            <div className="
                                                font-sans text-lg md:text-xl font-medium tracking-[-0.01em] mb-0.5 
                                                text-[var(--text)]
                                            ">
                                                {currentProfile.user.name}
                                            </div>
                                            <div className="
                                                font-mono text-xs tracking-[0.02em]
                                                text-[var(--muted)] 
                                            ">
                                                @{currentProfile.user.username}
                                            </div>
                                            {!isBlockedByMe && !isBlockedByThem && (
                                                <div className="
                                                    inline-flex items-center gap-[6px] mt-2 
                                                    font-mono text-[11px] tracking-[0.04em] text-[var(--dim)]
                                                ">
                                                    <div className={`
                                                        w-[6px] h-[6px] rounded-full 
                                                        ${currentProfile.user.isOnline ? 'bg-[var(--accent)]' : 'bg-gray-400 dark:bg-zinc-600'}
                                                    `} />
                                                    {currentProfile.user.isOnline ? 'online' : 'offline'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="
                                        flex flex-col 
                                        sm:flex-row flex-wrap 
                                        items-stretch sm:items-center justify-center
                                        gap-2.5
                                    ">
                                        {!isBlockedByMe && !isBlockedByThem && (
                                            <Button
                                                className={`
                                                    font-sans font-medium tracking-[0.01em] gap-1.5 
                                                    cursor-pointer transition-all active:scale-[0.97] 
                                                    w-full sm:w-[130px] lg:w-[140px] h-9 lg:h-10 text-xs lg:text-sm rounded-[8px] 
                                                    ${currentProfile.friendshipStatus !== 'none' ? 'border border-[var(--border)] bg-transparent text-[var(--text)] hover:bg-neutral-100 dark:hover:bg-zinc-800' : ''}
                                                `}
                                                onClick={() => {
                                                    if (currentProfile.friendshipStatus === "none") {
                                    
                                                        currentProfile.executeAction("send_request");
                                                    } else if (currentProfile.friendshipStatus === "pending_outgoing") {
                                                        currentProfile.executeAction("cancel_request");
                                                    } else if (currentProfile.friendshipStatus === "pending_incoming") {
                                                        currentProfile.executeAction("accept_request");
                                                    } else if (currentProfile.friendshipStatus === "friends") {
                                                        currentProfile.executeAction("unfriend");
                                                    }
                                                }}
                                            >
                                                {currentProfile.friendshipStatus === "none" && (
                                                    <>
                                                        <svg className="size-3.5 lg:size-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0zM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                                                        </svg>
                                                        <span>Add Friend</span>
                                                    </>
                                                )}
                                                {currentProfile.friendshipStatus === "pending_outgoing" && (
                                                    <>
                                                        <svg className="size-3.5 lg:size-4 animate-pulse" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                                                        </svg>
                                                        <span>Requested</span>
                                                    </>
                                                )}
                                                {currentProfile.friendshipStatus === "pending_incoming" && (
                                                    <>
                                                        <svg className="size-3.5 lg:size-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>Accept Request</span>
                                                    </>
                                                )}
                                                {currentProfile.friendshipStatus === "friends" && (
                                                    <span>Unfriend</span>
                                                )}
                                            </Button>
                                        )}
                                        {isFriend && (
                                            <Button className="
                                                font-sans font-medium tracking-[0.01em] 
                                                gap-1.5 cursor-pointer 
                                                transition-all active:scale-[0.97] 
                                                w-full sm:w-[130px] lg:w-[140px] 
                                                h-9 lg:h-10 
                                                text-xs lg:text-sm rounded-[8px]
                                            ">
                                                <svg className="size-3.5 lg:size-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.331 0-4.512-.645-6.374-1.766z" />
                                                </svg>
                                                <span>Message</span>
                                            </Button>
                                        )}
                                        {!isBlockedByThem && (
                                            <Button className={`
                                                font-sans font-medium tracking-[0.01em] 
                                                gap-1.5 cursor-pointer 
                                                transition-all active:scale-[0.97] 
                                                w-full sm:w-[130px] lg:w-[140px] 
                                                h-9 lg:h-10 
                                                text-xs lg:text-sm rounded-[8px]
                                                ${isBlockedByMe ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' : 'border border-[var(--border)] bg-transparent text-[var(--text)] hover:bg-neutral-100 dark:hover:bg-zinc-800'}
                                            `}
                                            
                                            onClick={() => {
                                                if (isBlockedByMe) {
        
                                                    currentProfile.executeAction("unblock");
                                                } else {
                                                    
                                                    currentProfile.executeAction("block");
                                                }
                                            }}
                                            >
                                                <svg className="size-3.5 lg:size-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                                                </svg>
                                                <span>{isBlockedByMe ? 'Unblock' : 'Block'}</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="
                                    h-[1px] my-[18px] 
                                    bg-[var(--border)]
                                " />
                                {isBlockedByThem ? (
                                    <div className="
                                        py-3 font-sans text-sm italic text-center
                                        text-red-500/80 bg-red-500/5 rounded-xl border border-red-500/10 p-4
                                    ">
                                        This user has blocked you.
                                    </div>
                                ) : (
                                    <>
                                        <div className="py-3">
                                            <div className="
                                                font-sans text-xs font-medium uppercase tracking-[0.04em] mb-[6px] 
                                                text-[var(--dim)]
                                            ">bio</div>
                                            <div className="
                                                font-sans text-sm leading-relaxed 
                                                text-[var(--text)]
                                            ">
                                                {currentProfile.user.bio || <span className="italic text-[var(--muted)]">No bio shared yet</span>}
                                            </div>
                                        </div>
                                        <div className="py-3">
                                            <div className="
                                                font-sans text-xs font-medium uppercase tracking-[0.04em] mb-[6px] 
                                                text-[var(--dim)]
                                            ">email address</div>
                                            <div className="
                                                font-mono text-xs tracking-[0.02em] 
                                                text-[var(--text)]
                                            ">
                                                {currentProfile.user.email}
                                            </div>
                                        </div>
                                        <div className="
                                            py-3 last:pb-0
                                        ">
                                            <div className="
                                                font-sans text-xs font-medium uppercase tracking-[0.04em] mb-[6px] 
                                                text-[var(--dim)]
                                            ">connections</div>
                                            <div className="
                                                font-sans text-sm text-[var(--text)] 
                                                flex items-center gap-1.5
                                            ">
                                                <svg className="size-4 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                                                </svg>
                                                <span>{currentProfile.user.mutualFriendsCount ?? 0} mutual friends</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}