import Avatar from "./Avatar";
import { twMerge } from "tailwind-merge";

type TextBubbleProps = {
    imageSrc?: string
    bubbleClassName?: string
    isMe: boolean
    isLast: boolean
    textContent?: string
}

type TypingBubbleProps = {
    imageSrc?: string
    bubbleClassName?: string
}

function TextBubble({
    imageSrc,
    bubbleClassName,
    isMe,
    isLast,
    textContent,
}: TextBubbleProps){

    return (

        <>

            <div className={`
                flex items-end w-full
                ${isLast ? 'mb-5' : ''}
                ${isMe ? 'justify-end' : 'justify-start'}
            `}>

                <Avatar containerClassName={`
                    ${!isMe && isLast ? 'mr-6 inline-block' : 'hidden'}
                `} imageClassName="
                    h-8 rounded-lg 
                " onlineIndicatorClassName="
                    hidden
                " imageSrc={imageSrc}/>

                <div className={twMerge(`
                    relative
                    w-fit max-w-80
                    rounded-lg p-3 pb-2 text-sm
                    cursor-pointer
                    ${isMe ? 'bg-[#240f04]' : 
                        'bg-[#ecddd4] #ecddd4 border border-[#e0c8b8]'}
                    ${isLast ? 'mb-5' : 'mb-1'}
                    ${isMe && !isLast ? 'mr-[56px]' : ''} 
                    ${!isMe && !isLast ? 'ml-[56px]' : ''}
                `, bubbleClassName)}>

                    <p className={`
                        m-auto
                        ${isMe ? 'text-[#f0dcc8]' : 'text-[#3a1a0a]'}
                    `}>{textContent}</p>

                    <div className={`
                        text-[#8c6a56]
                        text-xs font-semibold
                        flex justify-end
                        h-fit w-full
                    `}>
                        <p>3:41</p>
                    </div>

                    <div className={`
                        bg-inherit border-inherit
                        ${isLast ? 'block' : 'hidden'}
                        absolute ${isMe ? '-bottom-[4px] -right-[12px]' : 
                            '-bottom-[4px] -left-[12px] border'}
                        h-[11px] aspect-square
                        rounded-full
                    `}></div>

                    <div className={`
                        bg-inherit border-inherit
                        ${isLast ? 'block' : 'hidden'}
                        absolute ${isMe ? '-bottom-[8px] -right-[20px]' : 
                            '-bottom-[8px] -left-[20px] border'}
                        h-[7px] aspect-square
                        rounded-full
                    `}></div>

                </div>

                <Avatar containerClassName={`
                    ${isMe && isLast ? 'ml-6 inline-block' : 'hidden'}
                `} imageClassName="
                    h-8 rounded-lg 
                " onlineIndicatorClassName="
                    hidden
                " imageSrc={imageSrc}/>

            </div>

        </>

    )

}

export function TypingBubble({
    imageSrc,
    bubbleClassName,
}: TypingBubbleProps){

    return (
    
        <>

            <div className="
                flex justify-start items-center
            ">

                <Avatar containerClassName={`
                    'inline-block
                `} imageClassName="
                    h-8 rounded-lg 
                " onlineIndicatorClassName="
                    hidden
                " imageSrc={imageSrc}/>
        
                <div className={twMerge(`
                    bg-[#ecddd4] border border-[#e0c8b8]
                    flex justify-center items-center
                    gap-1
                    w-14 h-7
                    rounded-[16px] p-2
                    ml-2      
                `, bubbleClassName)}>

                    <div className={`
                        bg-[#3a1a0a]
                        h-2 aspect-square
                        rounded-full
                    `}></div>

                    <div className={`
                        bg-[#3a1a0a]
                        h-2 aspect-square
                        rounded-full
                    `}></div>

                    <div className={`
                        bg-[#3a1a0a]
                        h-2 aspect-square
                        rounded-full
                    `}></div>

                </div>

            </div>

        </>
    )

}

export default TextBubble;