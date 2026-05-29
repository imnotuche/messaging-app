import { useState } from "react";
import Avatar from "../UI/Avatar";
import Button from "../UI/Button";

function AllChats(){

    const [chatListExpand, setChatListExpand] = useState (false);

    return (

        <>

            <div className={`
                bg-[#f5ede6]
                relative overflow-hidden
                flex flex-col items-center
                h-full lg:w-[30%]
                border-l border-[#240f04] rounded-xl 
                ml-3
                transition-all duration-300 ease
                ${chatListExpand ? 'md:w-[35%]' : 'md:w-[10%]'}
            `}>

                <div className={`
                    bg-[#8c6a56]/10 backdrop-blur-sm
                    absolute top-0
                    flex items-center lg:justify-start
                    w-full h-16
                    md:text-lg lg:text-xl font-semibold
                    ${chatListExpand ? 'md:justify-start' : 'md:justify-center'}
                `}>

                    <Button className={`
                        bg-[#f0dcc8]/0
                        md:flex lg:hidden 
                        justify-center items-center
                        md:w-10 md:h-10
                        rounded-xl shrink-0
                    `}
                        onClick={() => {
                            setChatListExpand(p => !p);
                        }}
                    >
                        <svg className={`
                            size-4 text-[#240f04] 
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
                        lg:block 
                        md:ml-2 lg:ml-8
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
                    my-16 p-3
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
                                md:h-10 lg:h-12
                            " />

                            <div className={`
                                lg:block lg:opacity-100
                                lg:translate-x-0
                                w-[70%] ml-2
                                ${chatListExpand ? 'translate-x-0 opacity-100 md:block': 'translate-x-[500px] opacity-0 md:hidden'}
                            `}>

                                <p className="
                                    text-m font-semibold text-[#240f04]
                                    truncate
                                    leading-5
                                    mb-[2px]
                                ">Nobody</p>

                                <p className="
                                    md:text-xs lg:text-sm 
                                    font-medium text-[#a07050]
                                    truncate
                                    leading-5
                                ">

                                    <svg className="
                                        hidden 
                                        md:size-3.5 lg:size-4 ml-1
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
                                        md:size-3.5 lg:size-4 mr-1
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
                                lg:flex
                                flex-col flex-1
                                justify-center items-end lg:opacity-100
                                lg:translate-x-0
                                ${chatListExpand ? 'translate-x-0 opacity-100 md:flex': 'translate-x-[500px] opacity-0 md:hidden'}
                            `}>
                                <p className="
                                    md:text-xs lg:text-sm 
                                    font-semibold text-[#a07050]
                                ">3:41</p>

                                <div className="
                                    bg-[#240f04]
                                    flex justify-center items-center
                                    md:h-5 lg:h-6 aspect-square
                                    pb-[2px] my-[2px]
                                    rounded-full
                                    md:text-xs lg:text-sm 
                                    font-semibold text-[#f5ede6]
                                ">2</div>

                            </div>

                        </div>


                    </div>

                </div>

                <div className="
                    bg-[linear-gradient(to_bottom,#f5ede600_0%,#f5ede6_90%)]
                    absolute bottom-0
                    flex items-center
                    w-full h-12
                "></div>

            </div>

        </>

    );

}

export default AllChats;