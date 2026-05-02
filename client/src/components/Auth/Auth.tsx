import SignUp from "./SignUp";
import SignIn from "./SignIn";
import Hello from "./Hello";
import Welcome from "./Welcome";
import Button from "../UI/Button";

function Auth() {

    return (

        <>

            <div className="
                flex
                overflow-hidden
                rounded-[10px] lg:rounded-[10px]
                w-[95%] md:w-[550px] lg:w-[900px] md:h-[450px] lg:h-[500px]
                m-auto
            ">


                <div className="
                    bg-[#f5ede6] 

                    w-[100%] md:w-[60%] h-[100%]
                    py-6 px-4
                ">

                    <SignUp />
                    {/*<SignIn />*/}

                </div>

                <div className="
                    hidden
                    md:flex flex-col
                    justify-center items-center
                    p-3
                    bg-[#240f04]
                    w-[40%] h-[100%]
                ">

                    {/*<Hello />*/}
                    <Welcome />

                    <Button className="
                        flex 
                        border border-[#e0c8b8]
                        w-[50%] md:text-[0.6rem] lg:text-sm
                    "><span>SIGN UP</span></Button>

                </div>


            </div>

        </>

    )

}

export default Auth;