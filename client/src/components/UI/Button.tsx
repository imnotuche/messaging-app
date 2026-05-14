import { twMerge } from "tailwind-merge";

type ButtonProps=React.ButtonHTMLAttributes<HTMLButtonElement>;

function Button({
    children,
    className="",
    ...props
}:ButtonProps){

    return (

        <button {...props} className={twMerge(
            `flex justify-center items-center
            overflow-hidden
            text-[0.8rem] text-[#f0dcc8]
            bg-[#240f04] 
            h-[40px] w-[150px] lg:h-[45px] lg:w-[200px]
            rounded-[22px]`,
            className
        )} >
            {children}
        </button>

    )

}

export default Button;