import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "./UI/Avatar";
import { useSearchStore } from "../stores/searchStore";

function Search() {
    const searchStore = useSearchStore();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!searchStore.searchUserQuery.trim()) {
            searchStore.clearSearch();
            return;
        }

        if (searchStore.searchUserResults.length === 0) {
            setIsLoading(true);
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsLoading(true);
            try {
                const queryString = `query=${encodeURIComponent(searchStore.searchUserQuery)}`;
                await searchStore.searchUser(queryString);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchStore.searchUserQuery, searchStore.searchUser, searchStore.clearSearch]);

    return (
        <>
            <div className={`
                bg-[var(--bg)] shadow-[0_8px_32px_rgba(15,23,42,0.06)]
                relative z-0
                flex flex-col items-center
                w-full flex-1
                m-2.5 md:m-3 mb-0 md:mb-0 lg:mb-3 lg:ml-0
                rounded-xl
                transition-all duration-300 ease
            `}>

                <div className={`
                    bg-[var(--chat-header-mask)] backdrop-blur-sm
                    absolute top-0
                    flex flex-row items-center justify-between
                    w-full h-14 md:h-16
                    rounded-t-xl 
                    border-b border-[var(--border)]
                    px-4 md:px-6 lg:px-8
                    z-10
                `}>

                    <div className={`
                        flex items-center
                        shrink-0
                    `}>
                        <p className={`
                            text-[var(--text)] text-base lg:text-lg  font-bold
                            transition-all duration-300 ease
                        `}>Search</p>
                    </div>

                    <div className={`
                        flex-1 max-w-xl ml-4 md:ml-6 lg:ml-8
                    `}>
                        <div className="relative flex items-center w-full">
                            <span className="absolute left-2.5 text-[var(--muted)]">
                                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.603 10.601Z" />
                                </svg>
                            </span>
                            <input 
                                type="text"
                                value={searchStore.searchUserQuery}
                                onChange={(e) => searchStore.setSearchQuery(e.target.value)}
                                placeholder="Search for people..."
                                className="
                                    w-full pl-8 pr-3 py-2
                                    rounded-lg font-sans text-xs md:text-sm
                                    border border-[var(--border)]
                                    bg-[var(--form-bg)] text-[var(--text)]
                                    placeholder:text-[var(--muted)]
                                    focus:outline-none
                                "
                            />
                        </div>
                    </div>

                </div>

                <div className="
                    flex-1 w-full
                    overflow-y-scroll
                    scrollbar-light
                    my-14 md:my-16 p-3
                ">
                    <div className="w-full">
                        {isLoading && (
                            <p className="text-xs text-[var(--muted)] px-3 py-2">Searching...</p>
                        )}

                        {!isLoading && searchStore.searchUserQuery && searchStore.searchUserResults.length === 0 && (
                            <p className="text-xs text-[var(--muted)] px-3 py-2">No users found.</p>
                        )}

                        {!isLoading && searchStore.searchUserResults.map((user) => (
                            <div 
                                key={user.user_id} 
                                onClick={() => {
                                    // Direct layout route push triggers automatic component useEffect mounting above
                                    navigate(`/friends/${user.user_id}`); 
                                }}
                                className={`
                                    flex items-center justify-between
                                    w-[100%] h-16
                                    md:mb-0 lg:mb-3
                                    px-3 md:px-4 lg:px-5
                                    rounded-xl
                                    hover:bg-[var(--form-bg)]
                                    transition-colors duration-200
                                    group relative cursor-pointer
                                `}
                            >
                                <div className="
                                    flex items-center 
                                    flex-1 min-w-0
                                ">
                                    <Avatar 
                                        imageSrc={user.profile} 
                                        imageClassName="h-9 md:h-10 lg:h-12" 
                                    />

                                    <div className={`
                                        block
                                        opacity-100
                                        translate-x-0
                                        w-[70%] ml-3
                                        min-w-0
                                    `}>
                                        <p className="
                                            text-sm md:text-base 
                                            font-semibold text-[var(--text)]
                                            truncate
                                            leading-5
                                            mb-[2px]
                                        ">{user.name}</p>

                                        <p className="
                                            text-xs lg:text-sm 
                                            font-medium text-[var(--muted)]
                                            truncate
                                            leading-5
                                        ">
                                            @{user.username}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="
                    absolute bottom-0
                    flex items-center
                    rounded-b-xl 
                    w-full h-12
                    pointer-events-none
                "
                style={{ background: "var(--chat-bottom-mask)" }}
                ></div>

            </div>
        </>
    );
}

export default Search;