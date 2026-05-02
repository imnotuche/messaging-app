import { twMerge } from "tailwind-merge";

type InputProps=React.InputHTMLAttributes<HTMLInputElement>;

function Input({
    className="",
    ...props
}:InputProps){

    return (

        <input {...props} className={twMerge(

            `flex justify-start items-center
            h-[40px] w-[100%]
            pl-[10px] mb-[10px]
            rounded-[5px]
            border border-[#e0c8b8]
            focus:outline-none 
            placeholder:text-xs lg:placeholder:text-sm
            placeholder-[#a07050]
            text-sm text-[#3a1a0a] font-medium`,
            className

        )}/>

    )

}

export default Input;