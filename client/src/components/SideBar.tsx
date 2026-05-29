import { useState } from "react";
import Avatar from "./UI/Avatar";

function SideBar(){

    type NavItem = 
    | "chats"
    | "friends"
    | "search"
    | "settings";
    const [active, setActive] = useState<NavItem>("chats")

    return (

        <>

            <div className="
                bg-[#240f04]
                flex lg:flex-col
                md:justify-center md:items-center
                md:h-14 lg:h-full md:w-full lg:w-[15%]
            ">

                <h1 className="
                    hidden lg:flex items-center
                    w-full h-20
                    mb-5 pl-10
                    text-2xl font-bold text-[#e8d5c4]
                ">Andora</h1>

                <div className="
                    flex lg:block 
                    justify-center
                    lg:w-full md:h-full flex-1
                    md:ml-3 lg:ml-8
                    md:pb-3.5 lg:pb-0
                    md:text-sm lg:text-base font-semibold
                    text-[#8c6a56] 
                ">

                    <div className={`
                        flex items-center 
                        md:justify-center lg:justify-start
                        md:w-28 lg:w-full md:h-full lg:h-12 
                        lg:pl-6 md:rounded-b-lg lg:rounded-none
                        md:rounded-l-0 lg:rounded-l-lg 
                        cursor-pointer
                        ${active == 'chats' ? 'bg-[#f5ede6]' : ''}
                    `}
                    onClick={() => {
                        setActive("chats")
                    }}>

                        <svg className="
                            size-5 lg:size-6 mr-2
                        " 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke-width="1.5" 
                            stroke="currentColor"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                        </svg>

                        <span className="hidden md:inline">Chats</span>

                    </div>

                    <div className={`
                        flex items-center 
                        md:justify-center lg:justify-start
                        md:w-28 lg:w-full md:h-full lg:h-12  
                        lg:pl-6 md:rounded-b-lg lg:rounded-none
                        md:rounded-l-0 lg:rounded-l-lg
                        cursor-pointer
                        ${active == 'friends' ? 'bg-[#f5ede6]' : ''}
                    `}
                    onClick={() => {
                        setActive("friends")
                    }}>
                        <svg className="
                            size-5 lg:size-6 mr-2
                        " 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke-width="1.5" 
                            stroke="currentColor"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                        </svg>

                        <span className="hidden md:inline">Friends</span>

                    </div>

                    <div className={`
                        flex items-center 
                        md:justify-center lg:justify-start
                        md:w-28 lg:w-full md:h-full lg:h-12 
                        lg:pl-6 md:rounded-b-lg lg:rounded-none
                        md:rounded-l-0 lg:rounded-l-lg
                        cursor-pointer
                        ${active == 'search' ? 'bg-[#f5ede6]' : ''}
                    `}
                    onClick={() => {
                        setActive("search")
                    }}>

                        <svg className="
                            size-5 lg:size-6 mr-2
                        " 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" viewBox="0 0 24 24" 
                            stroke-width="1.5" 
                            stroke="currentColor"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>

                        <span className="hidden md:inline">Search</span>

                    </div>

                    <div className={`
                        flex items-center 
                        md:justify-center lg:justify-start
                        md:w-28 lg:w-full md:h-full lg:h-12 
                        lg:pl-6 md:rounded-b-lg lg:rounded-none
                        md:rounded-l-0 lg:rounded-l-lg
                        cursor-pointer
                        ${active == 'settings' ? 'bg-[#f5ede6]' : ''}
                    `}
                    onClick={() => {
                        setActive("settings")
                    }}>

                        <svg className="
                            size-5 lg:size-6 mr-2
                        " 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" viewBox="0 0 24 24" 
                            stroke-width="1.5" 
                            stroke="currentColor"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>

                        <span className="hidden md:inline">Settings</span>

                    </div>

                </div>

                <div className="
                    relative group
                    flex justify-center items-center
                    w-fit lg:w-full
                    p-2 lg:pt-3 lg:mb-5
                    cursor-pointer
                ">

                    <div className={`
                        bg-[#f5ede6]
                        hidden group-hover:block
                        absolute z-20 overflow-hidden
                        top-0 md:right-4 lg:right-1/2
                        -translate-y-full lg:translate-x-1/2
                        h-fit md:w-[120px] lg:w-[60%]
                        rounded-lg border border-[#e0c8b8]
                        text-[0.8rem] font-bold
                        text-[#8c6a56] 
                    `}>

                        <div className="
                            flex justify-start items-center
                            w-full h-10 pl-3
                        ">

                            <svg className="
                                size-[1.2rem]
                                mr-2
                            " 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke-width="2.5" 
                                stroke="currentColor"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>

                            Profile
                        </div>

                        <div className="
                            flex justify-start items-center
                            w-full h-10 pl-3
                        ">

                            <svg className="
                                size-[1.2rem]
                                mr-2
                            "
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke-width="2.5" 
                                stroke="currentColor" 
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                            </svg>

                            Sign Out
                        </div>

                        <div className="
                            flex justify-start items-center
                            w-full h-10 pl-3
                        ">

                            <svg className="
                                size-[1.2rem] hidden
                                mr-2
                            " 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke-width="2.5" 
                                stroke="currentColor"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                            </svg>

                            <svg className="
                                size-[1.2rem]
                                mr-2
                            "
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke-width="2.5" 
                                stroke="currentColor" 
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                            </svg>

                            Dark Mode
                        </div>

                    </div>

                    <Avatar containerClassName="
                        mr-2
                    " onlineIndicatorClassName="
                        hidden
                    " imageClassName="
                        h-8 md:h-9
                    "/>

                    <div className="
                        hidden lg:block
                        w-[70%]
                    ">
                        <p className="
                            text-m font-medium text-[#f0dcc8]
                            truncate
                            leading-4
                        ">?*</p>

                        <p className="
                            text-xs font-medium text-[#8c6a56]
                            truncate
                            leading-4
                        "><span>@</span>imnotuche</p>

                    </div>

                </div>

            </div>

        </>

    );

}

export default SideBar;