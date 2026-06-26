import { useState, useRef, useEffect, type ChangeEvent } from "react";
import Avatar from "../UI/Avatar";

import { useAuthStore } from "../../stores/authStore";


type ProfileData = {
    name: string;
    username: string;
    email: string;
    bio: string;
};


export default function SettingsPage() {

    const auth = useAuthStore();

    const [activeEditField, setActiveEditField] = useState<keyof ProfileData | null>(null);
    const [editBuffer, setEditBuffer] = useState<string>("");
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

    useEffect(() => {

        if (activeEditField && inputRef.current) {
            inputRef.current.focus();
            
            // Check if setSelectionRange is supported by the input type to avoid DOMExceptions
            if (
                inputRef.current instanceof HTMLTextAreaElement || 
                (inputRef.current instanceof HTMLInputElement && ["text", "search", "url", "tel", "password"].includes(inputRef.current.type))
            ) {
                const len = inputRef.current.value.length;
                inputRef.current.setSelectionRange(len, len);
            }
        }

    }, [activeEditField]);

    const openEdit = (field: keyof ProfileData) => {

        setActiveEditField(field);
        // source data directly from global store properties
        setEditBuffer(auth.user[field] || "");

    };

    const cancelEdit = () => {

        setActiveEditField(null);
        setEditBuffer("");

    };

    const confirmEdit = async (field: keyof ProfileData) => {

        let val = editBuffer.trim();

        if (field === "name") {
            if (!val || val.length < 2) {
                shakeInputAnimation("at least 2 characters");
                return;
            }
        }

        if (field === "username") {
            if (!val.startsWith("@")) val = "@" + val;
            if (!/^@[a-z0-9_]{1,}$/.test(val)) {
                shakeInputAnimation("lowercase letters, numbers, _ only");
                return;
            }
        }

        if (field === "email") {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                shakeInputAnimation("enter a valid email address");
                return;
            }
        }

        try {
            // trigger asynchronous state database mutation updates cleanly
            await auth.update({
                [field]: field === "username" ? val.replace("@", "") : val
            });

            setActiveEditField(null);

        } catch (err) {
            console.error("Mutation failure state hook:", err);
            shakeInputAnimation("Server sync error occurred");
        }

    };

    const shakeInputAnimation = (message: string) => {

        if (!inputRef.current) return;
        const target = inputRef.current;
        
        target.classList.add("border-red-400", "shadow-[0_0_0_3px_rgba(248,113,113,0.15)]");
        target.placeholder = message;
        setEditBuffer("");
        
        target.animate([
            { transform: "translateX(0)" },
            { transform: "translateX(-5px)" },
            { transform: "translateX(5px)" },
            { transform: "translateX(-4px)" },
            { transform: "translateX(4px)" },
            { transform: "translateX(0)" },
        ], { duration: 320, easing: "ease-out" });

        setTimeout(() => {
            if (target) {
                target.classList.remove("border-red-400", "shadow-[0_0_0_3px_rgba(248,113,113,0.15)]");
            }
        }, 2000);

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
                
                <div className="
                    bg-[var(--chat-header-mask)] backdrop-blur-sm
                    absolute
                    z-10
                    flex items-center
                    w-full h-16 lg:h-20
                    px-4 lg:px-6
                    border-b border-[var(--border)]
                ">

                    <h1 className="
                        font-sans text-base lg:text-lg font-semibold tracking-[-0.01em] text-[var(--text)]
                    ">
                        Settings
                    </h1>

                </div>

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

                        <div className="
                            relative overflow-hidden rounded-[20px] 
                            border border-[var(--card-border)] bg-[var(--form-bg)] shadow-[var(--card-shadow)] 
                            before:content-[''] before:block before:h-[2px] before:bg-gradient-to-r 
                            before:from-transparent before:via-blue-500/20 before:to-transparent
                        ">

                            <div className="
                                relative p-[22px] sm:p-7 md:p-[28px] md:px-[32px]
                            ">

                                <div className="
                                    flex items-center gap-[22px]
                                ">

                                    <div className="
                                        group relative shrink-0 cursor-pointer overflow-hidden
                                    ">

                                        <Avatar 
                                            imageClassName="w-16 h-16 md:w-20 md:h-20"
                                            onlineIndicatorClassName="hidden"
                                        />
                                        

                                    </div>
                                    
                                    <div className="
                                        flex-1 min-w-0
                                    ">

                                        <div className="
                                            font-sans text-lg md:text-xl font-medium tracking-[-0.01em] mb-0.5 text-[var(--text)]
                                        ">
                                            {auth.user.name}
                                        </div>

                                        <div className="
                                            font-mono text-xs text-[var(--muted)] tracking-[0.02em]
                                        ">
                                            <span>@</span>{auth.user.username}
                                        </div>

                                        <div className="
                                            inline-flex items-center gap-[6px] mt-2 font-mono text-[11px] tracking-[0.04em] text-[var(--dim)]
                                        ">
                                            <div className="
                                                w-[6px] h-[6px] bg-[var(--accent)]
                                            " />
                                            online
                                        </div>

                                    </div>

                                </div>

                                <div className="
                                    h-[1px] my-[18px] bg-[var(--border)]
                                " />

                                <div className="
                                    group relative py-3
                                ">

                                    <div className="
                                        font-sans text-xs font-medium uppercase tracking-[0.04em] mb-[6px] text-[var(--dim)]
                                    ">display name</div>
                                    
                                    {activeEditField !== "name" ? (
                                        <div onClick={() => openEdit("name")} className="
                                            flex items-center gap-[10px] cursor-pointer py-[2px] rounded-[6px]
                                        ">
                                            <span className="font-sans text-sm text-[var(--text)]">{auth.user.name}</span>

                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-[var(--muted)]">
                                                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                                                    <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </span>

                                        </div>
                                    ) : (
                                        <div className="
                                            flex flex-col gap-2 mt-[6px]
                                        ">

                                            <input 
                                                ref={inputRef as React.RefObject<HTMLInputElement>}
                                                type="text" 
                                                value={editBuffer}
                                                onChange={(e) => setEditBuffer(e.target.value)}
                                                maxLength={32}
                                                placeholder="Your display name"
                                                autoComplete="off"
                                                className="
                                                    w-full rounded-[9px] px-[13px] py-[9px] font-sans text-sm 
                                                    outline-none transition-all border border-[var(--border)] 
                                                    bg-[var(--input-bg)] text-[var(--text)] focus:bg-[var(--input-bg-f)] 
                                                    focus:border-[var(--border-hi)]
                                                "
                                            />

                                            <div className="flex gap-2">
                                                <button onClick={() => confirmEdit("name")} className="px-3 py-[6px] rounded-[6px] font-sans font-medium text-xs tracking-[0.01em] cursor-pointer transition-all active:scale-[0.97] bg-[var(--cta-bg)] text-[var(--cta-text)]">confirm</button>
                                                <button onClick={cancelEdit} className="px-3 py-[6px] rounded-[6px] font-sans font-medium text-xs tracking-[0.01em] cursor-pointer transition-all active:scale-[0.97] bg-transparent border border-[var(--border)] text-[var(--muted)]">cancel</button>
                                            </div>

                                        </div>
                                    )}

                                </div>

                                <div className="
                                    group relative py-3
                                ">

                                    <div className="
                                        font-sans text-xs font-medium uppercase tracking-[0.04em] mb-[6px] text-[var(--dim)]
                                    ">username</div>
                                    
                                    {activeEditField !== "username" ? (
                                        <div onClick={() => openEdit("username")} className="
                                            flex items-center gap-[10px] cursor-pointer py-[2px] rounded-[6px]
                                        ">
                                            <span className="font-mono text-xs tracking-[0.02em] text-[var(--text)]">@{auth.user.username}</span>
                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-[var(--muted)]">
                                                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                                                    <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="
                                            flex flex-col gap-2 mt-[6px]
                                        ">
                                            <input 
                                                ref={inputRef as React.RefObject<HTMLInputElement>}
                                                type="text" 
                                                value={editBuffer}
                                                onChange={(e) => setEditBuffer(e.target.value.toLowerCase().replace(/\s/g, ""))}
                                                maxLength={24}
                                                placeholder="@username"
                                                autoComplete="off"
                                                className="
                                                    w-full rounded-[9px] px-[13px] py-[9px] font-mono text-xs tracking-[0.02em]
                                                    outline-none transition-all border border-[var(--border)] 
                                                    bg-[var(--input-bg)] text-[var(--text)] focus:bg-[var(--input-bg-f)] 
                                                    focus:border-[var(--border-hi)]
                                                "
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => confirmEdit("username")} className="px-3 py-[6px] rounded-[6px] font-sans font-medium text-xs tracking-[0.01em] cursor-pointer transition-all active:scale-[0.97] bg-[var(--cta-bg)] text-[var(--cta-text)]">confirm</button>
                                                <button onClick={cancelEdit} className="px-3 py-[6px] rounded-[6px] font-sans font-medium text-xs tracking-[0.01em] cursor-pointer transition-all active:scale-[0.97] bg-transparent border border-[var(--border)] text-[var(--muted)]">cancel</button>
                                            </div>
                                        </div>
                                    )}

                                </div>

                                <div className="
                                    group relative py-3
                                ">

                                    <div className="
                                        font-sans text-xs font-medium uppercase tracking-[0.04em] mb-[6px] text-[var(--dim)]
                                    ">email</div>
                                    
                                    {activeEditField !== "email" ? (
                                        <div onClick={() => openEdit("email")} className="
                                            flex items-center gap-[10px] cursor-pointer py-[2px] rounded-[6px]
                                        ">
                                            <span className="font-sans text-sm text-[var(--text)]">{auth.user.email}</span>
                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-[var(--muted)]">
                                                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                                                    <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="
                                            flex flex-col gap-2 mt-[6px]
                                        ">
                                            <input 
                                                ref={inputRef as React.RefObject<HTMLInputElement>}
                                                type="email" 
                                                value={editBuffer}
                                                onChange={(e) => setEditBuffer(e.target.value)}
                                                placeholder="you@email.com"
                                                autoComplete="off"
                                                className="
                                                    w-full rounded-[9px] px-[13px] py-[9px] font-sans text-sm 
                                                    outline-none transition-all border border-[var(--border)] 
                                                    bg-[var(--input-bg)] text-[var(--text)] focus:bg-[var(--input-bg-f)] 
                                                    focus:border-[var(--border-hi)]
                                                "
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => confirmEdit("email")} className="px-3 py-[6px] rounded-[6px] font-sans font-medium text-xs tracking-[0.01em] cursor-pointer transition-all active:scale-[0.97] bg-[var(--cta-bg)] text-[var(--cta-text)]">confirm</button>
                                                <button onClick={cancelEdit} className="px-3 py-[6px] rounded-[6px] font-sans font-medium text-xs tracking-[0.01em] cursor-pointer transition-all active:scale-[0.97] bg-transparent border border-[var(--border)] text-[var(--muted)]">cancel</button>
                                            </div>
                                        </div>
                                    )}

                                </div>

                                <div className="
                                    group relative py-3 last:pb-0
                                ">

                                    <div className="
                                        font-sans text-xs font-medium uppercase tracking-[0.04em] mb-[6px] text-[var(--dim)]
                                    ">bio</div>
                                    
                                    {activeEditField !== "bio" ? (
                                        <div onClick={() => openEdit("bio")} className="
                                            flex items-center gap-[10px] cursor-pointer py-[2px] rounded-[6px]
                                        ">
                                            <span className="font-sans text-sm leading-relaxed text-[var(--text)]">{auth.user.bio}</span>
                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-[var(--muted)]">
                                                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                                                    <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="
                                            flex flex-col gap-2 mt-[6px]
                                        ">
                                            <textarea 
                                                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                                                value={editBuffer}
                                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditBuffer(e.target.value)}
                                                maxLength={120}
                                                placeholder="A short bio..."
                                                className="
                                                    w-full resize-vertical min-h-[72px] rounded-[9px] 
                                                    px-[13px] py-[9px] font-sans text-sm leading-relaxed 
                                                    outline-none transition-all border border-[var(--border)] 
                                                    bg-[var(--input-bg)] text-[var(--text)] focus:bg-[var(--input-bg-f)] 
                                                    focus:border-[var(--border-hi)]
                                                "
                                            />
                                            <div 
                                                className={`font-mono text-[10px] text-right -mt-0.5 ${(120 - editBuffer.length) <= 20 ? 'text-red-400' : 'text-[var(--dim)]'}`}
                                            >
                                                {120 - editBuffer.length} / 120
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => confirmEdit("bio")} className="px-3 py-[6px] rounded-[6px] font-sans font-medium text-xs tracking-[0.01em] cursor-pointer transition-all active:scale-[0.97] bg-[var(--cta-bg)] text-[var(--cta-text)]">confirm</button>
                                                <button onClick={cancelEdit} className="px-3 py-[6px] rounded-[6px] font-sans font-medium text-xs tracking-[0.01em] cursor-pointer transition-all active:scale-[0.97] bg-transparent border border-[var(--border)] text-[var(--muted)]">cancel</button>
                                            </div>
                                        </div>
                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </>

    );

}