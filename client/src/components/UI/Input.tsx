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
            focus:outline-none placeholder:text-sm
            text-sm font-medium`,
            className

        )}/>

    )

}

export default Input;