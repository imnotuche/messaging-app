import Input from "../UI/Input";
import Button from "../UI/Button";

function SignIn() {

    return (
        <>

            <div className="
                flex flex-col
                justify-center items-center
                w-[100%] h-[100%]
            ">

                <h1 className="
                    text-4xl font-semibold
                    mb-[50px]
                ">Sign in to Andora</h1>

                <form className="
                    flex flex-col items-center
                    w-[300px]
                ">

                    <div className="
                        w-[100%]
                    ">
                        <Input type="email" placeholder="Email"></Input>
                        <Input type="text" placeholder="Username"></Input>
                    </div>

                    <div className="
                        flex
                        w-[100%] h-[40px]
                        rounded-[5px] overflow-hidden
                        bg-yellow-500
                    ">

                        <Input type="password" placeholder="Password" className="
                            flex
                            rounded-none
                            w-[100%] h-[100%] m-0
                        "></Input>

                        <Button type="button" className="
                            h-[100%] w-[50px]
                            rounded-none
                            bg-slate-800
                        "></Button>

                    </div>
                
                    <Button type="submit" className="
                        mt-[30px]
                    ">SIGN IN</Button>

                </form>


            </div>

        </>
    )

}

export default SignIn
