import { useRef } from "react";

import Avatar from "../UI/Avatar";
import TextBubble from "../UI/TextBubble";
import { TypingBubble } from "../UI/TextBubble";
import Button from "../UI/Button";

function CurrentChat(){

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleInput = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    };

    return (

        <>

            <div className="
                bg-[#f5ede6]
                relative overflow-hidden
                flex flex-col
                h-full w-[70%]
                rounded-xl 
            ">
                
                <div className="
                    bg-[#8c6a56]/10 backdrop-blur-sm
                    absolute
                    z-10
                    flex items-center
                    w-full h-[88px]
                ">

                    <Avatar containerClassName="
                        mx-5
                    " onlineIndicatorClassName="
                        hidden
                    " imageClassName="
                        h-14
                    "/>

                    <div>

                        <p className="
                            text-[#240f04]
                            text-xl font-semibold
                            leading-6
                        ">Uchechukwu ekwe</p>

                        <p className="
                            text-[#a87c5e]
                            text-s font-medium
                            leading-5
                        ">online</p>

                    </div>

                </div>

                <div className="
                    overflow-y-auto scrollbar-light
                    w-full flex-1
                    p-5 pt-24 pb-24">

                    <div className="
                        w-full
                    ">

                        <TextBubble isMe={false} isLast={false} textContent="
                            some random text
                        "/>
                        <TextBubble isMe={false} isLast={true} textContent="
                            some random text thats supposed to be really really long
                        "/>
                        <TextBubble isMe={true} isLast={false} textContent="
                            another random text
                        "/>
                        <TextBubble isMe={true} isLast={true}textContent="
                            another random text thats supposed to be really really long
                        "/>
                        <TextBubble isMe={false} isLast={false} textContent="
                            some random text
                        "/>
                        <TextBubble isMe={false} isLast={true} textContent="
                            some random text thats supposed to be really really long
                        "/>
                        <TextBubble isMe={true} isLast={false} textContent="
                            another random text
                        "/>
                        <TextBubble isMe={true} isLast={true}textContent="
                            another random text thats supposed to be really really long
                        "/>
                        <TypingBubble/>

                    </div>

                </div>

                <div className="
                    bg-[linear-gradient(to_bottom,#f5ede600_0%,#f5ede6_90%)]
                    absolute bottom-0
                    z-10
                    flex items-center justify-center
                    w-full p-5
                ">

                    <div className="
                        flex items-center overflow-hidden
                        w-[80%]
                    ">

                        <div className="
                            bg-white
                            flex-1 
                            py-2 mr-4 
                            border border-[#e0c8b8] rounded-[7px]
                        ">

                            <textarea className="
                                text-[#3a1a0a] text-sm font-medium
                                placeholder:font-medium
                                placeholder-[#a07050] placeholder:text-sm
                                max-h-28 w-full
                                resize-none overflow-y-auto
                                scrollbar-light 
                                outline-none
                                px-3
                            "   
                                placeholder="Type a message"
                                ref={textareaRef}
                                onInput={handleInput}
                                rows={1}
                            />

                        </div>

                        <Button className="
                            lg:h-[40px] lg:w-[40px]
                            rounded-[7px]
                        "></Button>

                    </div>

                </div>

            </div>

        </>

    );

}

export default CurrentChat;