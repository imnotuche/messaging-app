import { twMerge } from "tailwind-merge";

type InputProps=React.InputHTMLAttributes<HTMLInputElement>;

function Input({
    className="",
    ...props
}:InputProps){

    return (

        <input {...props} className={twMerge(

            `bg-[var(--input-bg)]
            flex justify-start items-center
            h-[40px] w-[100%]
            pl-[10px] mb-[10px]
            rounded-[5px]
            border border-[var(--border)]
            focus:outline-none focus:border-[var(--input-bg-f)]
            placeholder:text-xs lg:placeholder:text-sm
            placeholder-[var(--dim)]
            text-sm text-[var(--text)]`,
            className

        )}/>

    )

}

export default Input;