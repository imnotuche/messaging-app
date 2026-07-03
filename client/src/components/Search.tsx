import { useState, useEffect } from "react";
import Avatar from "./UI/Avatar";
import { getUsers } from "../services/userService"; // Adjust this path to your actual file structure

// Define the interface for the expected User data structure
interface User {
    id: string; // or number, depending on your backend
    name: string;
    username: string;
    profile?: string;
    bio?: string;
}

function Search() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Handles the side effect whenever searchQuery changes (Equivalent to Vue's watch + timeout)
    useEffect(() => {
        // Immediately clear results if query is empty
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);

        // Debounce: Wait 500ms after the user stops typing before making the network request
        const delayDebounceFn = setTimeout(async () => {

            try {
                // Construct query string format expected by your service
                const queryString = `query=${encodeURIComponent(searchQuery)}`;
                const response = await getUsers(queryString);
                //Load serch results
                const result = response.data.payload
                setSearchResults(result);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setIsLoading(false);
            }
            
        }, 500);

        // Cleanup function clears the timeout if the user types another character before 500ms
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

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
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
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
                        {/* Status Message Handling */}
                        {isLoading && (
                            <p className="text-xs text-[var(--muted)] px-3 py-2">Searching...</p>
                        )}

                        {!isLoading && searchQuery && searchResults.length === 0 && (
                            <p className="text-xs text-[var(--muted)] px-3 py-2">No users found.</p>
                        )}

                        {/* Dynamic Rendering Loop using .map */}
                        {!isLoading && searchResults.map((user) => (
                            <div key={user.id} className={`
                                flex items-center justify-between
                                w-[100%] h-16
                                md:mb-0 lg:mb-3
                                px-3 md:px-4 lg:px-5
                                rounded-xl
                                hover:bg-[var(--form-bg)]
                                transition-colors duration-200
                                group relative
                            `}>

                                <div className="
                                    flex items-center 
                                    flex-1 min-w-0
                                    cursor-pointer
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