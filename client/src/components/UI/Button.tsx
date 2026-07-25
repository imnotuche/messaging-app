import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { LoadingButtonAnimation } from "./LoadingElement";

type ButtonProps=Omit<React.ButtonHTMLAttributes<HTMLButtonElement>,"onClick"> & {
    onClick?:(e:React.MouseEvent<HTMLButtonElement>)=>void | Promise<void>;
    preventMultipleClicks?:boolean;
    loading?:boolean; //external control, for submit buttons that can't rely on onClick
};

function Button({
    children,
    className="",
    onClick,
    disabled=false,
    preventMultipleClicks=false,
    loading=false,
    ...props
}:ButtonProps){

    const [isLoading, setIsLoading] = useState(false);

    // either source can trigger the spinner, self-managed clicks or a parent
    // telling us the form is submitting
    const showLoading = isLoading || loading;

    async function handleClick(e:React.MouseEvent<HTMLButtonElement>){

        // clicks-dont-matter buttons skip all of this and behave like before
        if(!preventMultipleClicks){
            onClick?.(e);
            return;
        }

        if(isLoading) return;

        setIsLoading(true);

        try{
            const result = onClick?.(e);
            // only await if the handler actually gave us a promise, sync handlers
            // have no "done" signal so they just get a same-tick lock
            if(result instanceof Promise){
                await result;
            }
        } finally {
            setIsLoading(false);
        }

    }

    return (

        <button
            {...props}
            onClick={handleClick}
            disabled={disabled || showLoading}
            className={twMerge(
                `flex justify-center items-center
                overflow-hidden
                text-[0.8rem] text-[var(--cta-text)]
                bg-[var(--cta-bg)] 
                h-[40px] w-[150px] lg:h-[45px] lg:w-[200px]
                rounded-[22px]
                disabled:opacity-80`,
                className
            )} >
            {showLoading ? <LoadingButtonAnimation /> : children}
        </button>

    )

}

export default Button;