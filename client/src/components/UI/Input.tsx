import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

// We wrap the component in forwardRef so parent components can focus this input element programmatically
const Input = forwardRef<HTMLInputElement, InputProps>(({
    className = "",
    ...props
}, ref) => {

    return (
        <input 
            {...props} 
            ref={ref} // attached the incoming ref here
            className={twMerge(
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
            )}
        />
    )
});

// Setting a display name is highly recommended when using forwardRef for easier debugging
Input.displayName = "Input";

export default Input;