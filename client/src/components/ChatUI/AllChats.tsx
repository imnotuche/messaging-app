import { useState } from "react";
import Avatar from "../UI/Avatar";
import Button from "../UI/Button";

function AllChats(){

    const [chatListExpand, setChatListExpand] = useState (false);
    const [chatListVisible, setChatListVisible] = useState (false)

    return (

        <>

            <div className={`
                bg-[var(--bg)] shadow-[0_8px_32px_rgba(15,23,42,0.06)]
                absolute md:relative z-10 md:z-0
                right-3 md:right-0 bottom-1/2 md:bottom-0
                translate-y-1/2 md:translate-y-0 md:translate-x-0
                flex flex-col items-center
                h-[90%] md:h-full w-[80%] lg:w-[30%]
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

                    <div className="
                        w-full
                    ">

                        <div className={`
                            flex items-center
                            w-[100%] h-16 
                            md:mb-0 lg:mb-3
                            ${chatListExpand ? '' : 'md:justify-center'}
                        `}>

                            <Avatar imageClassName="
                                h-9 md:h-10 lg:h-12
                            " />

                            <div className={`
                                block lg:block 
                                opacity-100 lg:opacity-100
                                translate-x-0 lg:translate-x-0
                                w-[70%] ml-2
                                ${chatListExpand ? 'md:translate-x-0 opacity-100 md:block': 'md:translate-x-[500px] opacity-0 md:hidden'}
                            `}>

                                <p className="
                                    text-sm md:text-m 
                                    font-semibold text-[var(--text)]
                                    truncate
                                    leading-5
                                    mb-[2px]
                                ">Nobody</p>

                                <p className="
                                    text-xs lg:text-sm 
                                    font-medium text-[var(--muted)]
                                    truncate
                                    leading-5
                                ">

                                    <svg className="
                                        hidden 
                                        size-3 md:size-3.5 lg:size-4 ml-1
                                    "
                                        xmlns="http://www.w3.org/2000/svg" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        stroke-width="2" stroke-linecap="round" 
                                        stroke-linejoin="round" 
                                    >
                                        <path d="M18 6 7 17l-5-5"/>
                                        <path d="m22 10-7.5 7.5L13 16"/>
                                    </svg>

                                    <svg className="
                                        inline 
                                        size-3.5 lg:size-4 mr-1
                                    "
                                        xmlns="http://www.w3.org/2000/svg" 
                                        width="24" height="24" viewBox="0 0 24 24" 
                                        fill="none" stroke="currentColor" 
                                        stroke-width="2" 
                                        stroke-linecap="round" 
                                        stroke-linejoin="round"
                                    >
                                        <path d="M20 6 9 17l-5-5"/>
                                    </svg>

                                    i used to be somebodyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
                                </p>

                            </div>

                            <div className={`
                                flex lg:flex
                                flex-col flex-1
                                justify-center items-end 
                                opacity-100 lg:opacity-100
                                translate-x-0 lg:translate-x-0
                                ${chatListExpand ? 'md:translate-x-0 opacity-100 md:flex': 'md:translate-x-[500px] opacity-0 md:hidden'}
                            `}>
                                <p className="
                                    text-xs lg:text-sm 
                                    font-semibold text-[var(--muted)]
                                ">3:41</p>

                                <div className="
                                    bg-[var(--text)]
                                    flex justify-center items-center
                                    h-5 lg:h-6 aspect-square
                                    pb-[2px] my-[2px]
                                    rounded-full
                                    text-xs lg:text-sm 
                                    font-semibold text-[var(--bg)]
                                ">2</div>

                            </div>

                        </div>


                    </div>

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