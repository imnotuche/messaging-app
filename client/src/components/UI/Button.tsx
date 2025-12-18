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
            text-[0.8rem]
            bg-white
            h-[45px] w-[200px]
            rounded-[22px]`,
            className
        )} >
            {children}
        </button>

    )

}

export default Button;