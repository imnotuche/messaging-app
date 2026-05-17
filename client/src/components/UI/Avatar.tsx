import { twMerge } from "tailwind-merge";

type AvatarProps = {
    containerClassName?: string
    onlineIndicatorClassName?: string
    imageClassName?: string
    imageSrc?: string
}

function Avatar({
    containerClassName = "",
    onlineIndicatorClassName = "",
    imageClassName = "",
    imageSrc = "",
}: AvatarProps){

    return (

        <>
        
            <div className={twMerge(`
                relative inline-block
            `, containerClassName)}>

                <div className={twMerge(`
                    bg-[#1e9e66]
                    absolute top-0 right-0
                    translate-x-[1px] -translate-y-[1px]
                    h-3 aspect-square
                    rounded-full border-2 border-[#fdf8f5]
                `, onlineIndicatorClassName)}></div>

                <img src={imageSrc} className={twMerge(`
                    bg-[#3d1a08]
                    h-12 aspect-square 
                    rounded-lg
                `, imageClassName)}/>

            </div>

        </>

    )

}

export default Avatar;