import { useState } from "react";
import { useSettingsStore } from "../../stores/settingsStore";

import GridBg from "../UI/GridBg";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import Hello from "./Hello";
import Welcome from "./Welcome";
import Button from "../UI/Button";

function Auth() {

    const [isLogin, setIsLogin] = useState<boolean>(true);
    const settings = useSettingsStore();

    return (

        <>

            <GridBg className="
                flex justify-center items-center
                w-screen h-screen
            ">

                <Button className="
                    flex justify-center items-center
                    opacity-70 dark:opacity-50
                    overflow-hidden
                    absolute z-20
                    top-5 right-5 text-[var(--bg)]
                    h-8 w-8 lg:h-10 lg:w-10
                    rounded-full
                "
                onClick={() => settings.changeTheme()}
                >

                    <svg className={`
                        size-4 lg:size-5
                        ${settings.dark ? 'block' : 'hidden'}
                    `}
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth="3" 
                        stroke="currentColor"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                    </svg>

                    <svg className={`
                        size-4 lg:size-5
                        ${settings.dark ? 'hidden' : 'block'}
                    `}
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth="2.5" 
                        stroke="currentColor" 
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                    </svg>

                </Button>

                <div className={`
                    bg-[var(--form-bg)]
                    flex relative
                    overflow-hidden
                    border border-[var(--card-border)]
                    rounded-[10px] lg:rounded-[10px]
                    w-[320px] md:w-[550px] md:h-[450px] lg:w-[900px] lg:h-[500px]
                    transition-all duration-1000 ease
                    ${isLogin ? 'h-[400px]' : 'h-[450px]'}
                `}
                style = {{
                    boxShadow: "var(--card-shadow)"
                }}
                >

                    <div className={`
                        flex flex-col md:block
                        bg-[var(--form-bg)]
                        absolute z-10
                        w-[100%] md:w-[60%] h-[100%]
                        transition-all duration-1000 ease
                        ${isLogin ? 'md:translate-x-[0%]' : 'md:translate-x-[66.67%]'}
                    `}>

                        <SignUp isLogin={isLogin} setIsLogin={setIsLogin} />
                        <SignIn isLogin={isLogin} setIsLogin={setIsLogin} />

                    </div>

                    <div className={`
                        bg-[var(--panel-bg)]
                        md:flex flex-col 
                        absolute z-20
                        hidden overflow-hidden
                        justify-center items-center
                        p-3 border-x-[var(--separator)]
                        w-[40%] h-[100%]
                        transition-all duration-1000 ease
                        ${isLogin ? 'translate-x-[150%] border-r-transparent' : 'translate-x-[0%] border-l-transparent'}
                    `}>

                        <div className="
                            flex justify-center relative
                            h-[100px] w-[100%]
                        ">

                            <Hello isLogin = {isLogin} />
                            <Welcome isLogin = {isLogin} />

                        </div>

                        <Button className="
                            bg-white/0
                            flex relative
                            border border-[var(--panel-text)]
                            text-[var(--panel-text)]
                            w-[50%] md:text-[0.6rem] lg:text-sm
                        " onClick={()=>{
                            setIsLogin(prev => !prev);
                        }}>

                            <span className={`
                                absolute
                                transition-all duration-1000 ease
                                ${isLogin ? 'translate-x-0' : '-translate-x-40'}
                            `}>SIGN UP</span>

                            <span className={`
                                absolute
                                transition-all duration-1000 ease
                                ${isLogin ? 'translate-x-40' : 'translate-x-0'}
                            `}>SIGN IN</span>

                        </Button>

                    </div>


                </div>

            </GridBg>

        </>

    )

}

export default Auth;