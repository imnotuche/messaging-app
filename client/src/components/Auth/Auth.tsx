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
                rounded-[10px]
                w-[900px] h-[500px]
                overflow-hidden
            ">


                <div className="
                    bg-blue-300
                    w-[60%] h-[100%]
                ">

                    {/*<SignUp />*/}
                    <SignIn />

                </div>

                <div className="
                    flex flex-col
                    justify-center items-center
                    bg-green-700
                    w-[40%] h-[100%]
                ">

                    <Hello />
                    {/*<Welcome />*/}

                    <Button className="
                        w-[50%]
                    "></Button>

                </div>


            </div>

        </>

    )

}

export default Auth;