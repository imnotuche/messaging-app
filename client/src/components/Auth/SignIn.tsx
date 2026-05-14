import Input from "../UI/Input";
import Button from "../UI/Button";

import { useState } from "react";

type SignInProps = {
    isLogin: boolean;
    setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
};

function SignIn({ isLogin, setIsLogin } : SignInProps) {

    const [showPassword, setShowPassword] = useState(false);
    const [switchInput, setSwitchInput] = useState(false);

    return (
        <>

            <div className={`
                flex flex-col
                justify-center items-center
                w-[100%] h-[100%]
                absolute top-0 left-0
                transition-all duration-1000 md:duration-500 ease
                md:translate-y-0
                ${isLogin ? 'opacity-[100%] translate-y-0' : 
                    'opacity-[0%] pointer-events-none translate-y-[400px]'}
                ${isLogin ? 'md:delay-500' : ''}
            `}>

                <h1 className="
                    lg:hidden
                    text-l font-semibold text-[#a07050]
                    w-[100%]
                    mb-[50px] 
                    px-8
                ">
                    Sign in to <br />
                    <span className="
                        text-3xl text-[#240f04]
                    ">
                        Andora
                    </span>
                </h1>

                <h1 className="
                    hidden lg:block
                    text-4xl text-[#240f04] font-semibold
                    mb-[50px]
                ">Sign in to Andora</h1>

                <form className="
                    flex flex-col items-center
                    lg:w-[300px]
                ">

                    <div className="
                        flex
                        w-[100%] h-[40px]
                        border border-[#e0c8b8]
                        rounded-[5px] overflow-hidden
                        mb-6
                    ">
                        <Input type="email" placeholder="Email" className={`
                            rounded-none border-none
                            w-[100%] h-[100%] m-0

                            ${switchInput ? "block" : "hidden"}
                        `}></Input>

                        <Input type="text" placeholder="Username" className={`
                            rounded-none border-none
                            w-[100%] h-[100%] m-0

                            ${switchInput ? "hidden" : "block"}
                        `}></Input>

                        <Button type="button" className="
                            lg:pb-[0.4rem] pl-[0.1rem]
                            h-[100%] w-[50px] lg:w-[50px]
                            rounded-none
                        " onClick={()=>{setSwitchInput(prev=>!prev)}}>
                            <svg xmlns="http://www.w3.org/2000/svg" 
                                className="size-[50%]"
                                fill="none" viewBox="0 0 24 24" 
                                strokeWidth={1.5} 
                                stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                            </svg>
                        </Button>
                    </div>

                    <div className="
                        flex
                        w-[100%] h-[40px]
                        border border-[#e0c8b8]
                        rounded-[5px] overflow-hidden
                    ">

                        <Input type={showPassword ? "text" : "password"} placeholder="Password" className="
                            flex
                            rounded-none border-none
                            w-[100%] h-[100%] m-0
                            text-[#a07050]
                        "></Input>

                        <Button type="button" className="
                            lg:pb-[0.4rem] pl-[0.1rem]
                            h-[100%] w-[50px] lg:w-[50px]
                            rounded-none
                        " onClick={()=>{setShowPassword(prev=>!prev)}}>

                            <svg className={`
                                ${showPassword ? "inline" : "hidden"}
                                size-[50%]
                            `}
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" viewBox="0 0 24 24" 
                                strokeWidth={1.5} 
                                stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>

                            <svg className={`
                                ${showPassword ? "hidden" : "inline"}
                                size-[50%]
                            `}
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" viewBox="0 0 24 24" 
                                strokeWidth={1.5} 
                                stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>

                        </Button>

                    </div>
                
                    <Button type="submit" className="
                        mt-[30px] mb-[20px]
                    ">SIGN IN</Button>

                    <span className="
                        md:hidden
                        text-xs text-[#a07050]
                    ">
                        Don't have an account? <button type = "button" className="
                            text-[#7a4028]
                        " onClick={() => setIsLogin((prev : boolean) => !prev)}>Sign up</button>
                    </span>

                </form>


            </div>

        </>
    )

}

export default SignIn
