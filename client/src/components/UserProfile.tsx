import Avatar from "./UI/Avatar";

type UserProfileData = {
    name: string;
    username: string;
    email: string;
    bio: string;
    isOnline: boolean;
    mutualFriendsCount: number;
};

interface UserProfileProps {
    user?: UserProfileData; // Optional default values provided below for previewing
    onMessageClick?: () => void;
}

export default function UserProfile({ user, onMessageClick }: UserProfileProps) {
    // Default mock data matching another user profile configuration if none is passed
    const profile = user || {
        name: "Amaka",
        username: "@amaka_dev",
        email: "amaka@email.com",
        bio: "Designing digital experiences & drinking green tea. Hit me up if you want to collaborate!",
        isOnline: true,
        mutualFriendsCount: 4
    };

    return (
        <>
            <div className="
                bg-[var(--bg)]
                relative overflow-hidden
                flex flex-col
                w-full md:flex-1 lg:w-[70%]
                rounded-xl 
                m-2.5 md:m-3 mb-0 md:mb-0 lg:mb-3 lg:ml-0      
            ">
                
                {/* Header Mask */}
                <div className="
                    bg-[var(--chat-header-mask)] backdrop-blur-sm
                    absolute
                    z-10
                    flex items-center justify-between
                    w-full h-16 lg:h-20
                    px-4 lg:px-6
                    border-b border-[var(--border)]
                ">
                    <h1 className="
                        font-sans text-base lg:text-lg font-semibold tracking-[-0.01em] text-[var(--text)]
                    ">
                        User Profile
                    </h1>

                    {/* Action Button */}
                    <button 
                        onClick={onMessageClick}
                        className="
                            px-3.5 py-[7px] lg:px-4 lg:py-2
                            rounded-[8px] font-sans font-medium text-xs lg:text-sm tracking-[0.01em] 
                            cursor-pointer transition-all active:scale-[0.97] 
                            bg-[var(--cta-bg)] text-[var(--cta-text)]
                            flex items-center gap-1.5
                        "
                    >
                        <svg className="size-3.5 lg:size-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                        </svg>
                        <span>Message</span>
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="
                    flex-1 overflow-y-auto 
                    scrollbar-light dark:scrollbar-dark
                    px-4 lg:px-8
                    pt-20 lg:pt-28
                    pb-12
                ">
                    
                    <div className="
                        w-full max-w-[660px] mx-auto 
                        flex flex-col gap-5
                    ">

                        {/* Profile Info Container Card */}
                        <div className="
                            relative overflow-hidden rounded-[20px] 
                            border border-[var(--card-border)] bg-[var(--form-bg)] shadow-[var(--card-shadow)] 
                            before:content-[''] before:block before:h-[2px] before:bg-gradient-to-r 
                            before:from-transparent before:via-blue-500/20 before:to-transparent
                        ">

                            <div className="
                                relative p-[22px] sm:p-7 md:p-[28px] md:px-[32px]
                            ">

                                {/* Top Avatar Identity Section */}
                                <div className="
                                    flex items-center gap-[22px]
                                ">
                                    <div className="group relative shrink-0 overflow-hidden">
                                        <Avatar 
                                            imageClassName="w-16 h-16 md:w-20 md:h-20"
                                            onlineIndicatorClassName="hidden"
                                        />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="
                                            font-sans text-lg md:text-xl font-medium tracking-[-0.01em] mb-0.5 text-[var(--text)]
                                        ">
                                            {profile.name}
                                        </div>

                                        <div className="
                                            font-mono text-xs text-[var(--muted)] tracking-[0.02em]
                                        ">
                                            {profile.username}
                                        </div>

                                        <div className="
                                            inline-flex items-center gap-[6px] mt-2 font-mono text-[11px] tracking-[0.04em] text-[var(--dim)]
                                        ">
                                            <div className={`
                                                w-[6px] h-[6px] rounded-full
                                                ${profile.isOnline ? 'bg-[var(--accent)]' : 'bg-gray-400 dark:bg-zinc-600'}
                                            `} />
                                            {profile.isOnline ? 'online' : 'offline'}
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative Divider Line */}
                                <div className="
                                    h-[1px] my-[18px] bg-[var(--border)]
                                " />

                                {/* Bio Display Field */}
                                <div className="py-3">
                                    <div className="
                                        font-sans text-xs font-medium uppercase tracking-[0.04em] mb-[6px] text-[var(--dim)]
                                    ">bio</div>
                                    <div className="
                                        font-sans text-sm leading-relaxed text-[var(--text)]
                                    ">
                                        {profile.bio || <span className="italic text-[var(--muted)]">No bio shared yet</span>}
                                    </div>
                                </div>

                                {/* Email Display Field */}
                                <div className="py-3">
                                    <div className="
                                        font-sans text-xs font-medium uppercase tracking-[0.04em] mb-[6px] text-[var(--dim)]
                                    ">email address</div>
                                    <div className="
                                        font-mono text-xs tracking-[0.02em] text-[var(--text)]
                                    ">
                                        {profile.email}
                                    </div>
                                </div>

                                {/* Connections/Mutual Info Display Field */}
                                <div className="py-3 last:pb-0">
                                    <div className="
                                        font-sans text-xs font-medium uppercase tracking-[0.04em] mb-[6px] text-[var(--dim)]
                                    ">connections</div>
                                    <div className="
                                        font-sans text-sm text-[var(--text)] flex items-center gap-1.5
                                    ">
                                        <svg className="size-4 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                                        </svg>
                                        <span>{profile.mutualFriendsCount} mutual friends</span>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </>
    );
}