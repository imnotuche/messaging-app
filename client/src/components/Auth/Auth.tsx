import SignUp from "./SignUp";
import SignIn from "./SignIn";
import Hello from "./Hello";
import Welcome from "./Welcome";
import Button from "../UI/Button";

import { useState } from "react";

function Auth() {

    const [isLogin, setIsLogin] = useState<boolean>(true);

    return (

        <>

            <div className={`
                bg-[#f5ede6] 
                flex relative
                overflow-hidden
                rounded-[10px] lg:rounded-[10px]
                w-[320px] md:w-[550px] md:h-[450px] lg:w-[900px] lg:h-[500px]
                transition-all duration-1000 ease
                ${isLogin ? 'h-[400px]' : 'h-[450px]'}
            `}>

                <div className={`
                    flex flex-col md:block
                    bg-[#f5ede6] 
                    absolute z-10
                    w-[100%] md:w-[60%] h-[100%]
                    transition-all duration-1000 ease
                    ${isLogin ? 'md:translate-x-[0%]' : 'md:translate-x-[66.67%]'}
                `}>

                    <SignUp isLogin={isLogin} setIsLogin={setIsLogin} />
                    <SignIn isLogin={isLogin} setIsLogin={setIsLogin} />

                </div>

                <div className={`
                    bg-[#240f04]
                    md:flex flex-col 
                    absolute z-20
                    hidden overflow-hidden
                    justify-center items-center
                    p-3
                    w-[40%] h-[100%]
                    transition-all duration-1000 ease
                    ${isLogin ? 'translate-x-[150%]' : 'translate-x-[0%]'}
                `}>

                    <div className="
                        flex justify-center relative
                        h-[100px] w-[100%]
                    ">

                        <Hello isLogin = {isLogin} />
                        <Welcome isLogin = {isLogin} />

                    </div>

                    <Button className="
                        flex relative
                        border border-[#e0c8b8]
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

        </>

    )

}

export default Auth;

/*

function Auth() {
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#01040a" }}>
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="hex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon
              points="30,2 58,17 58,47 30,62 2,47 2,17"
              fill="none"
              stroke="rgba(180,80,20,0.15)"
              strokeWidth="0.8"
            />
          </pattern>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(80,25,5,0.55)" />
            <stop offset="100%" stopColor="rgba(1,4,10,0)" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex)" />
        <ellipse cx="50%" cy="50%" rx="55%" ry="45%" fill="url(#glow)" />
      </svg>
    </div>
  )
}

export default Auth */