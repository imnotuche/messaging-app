import { useNavigate} from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import Input from "../UI/Input";
import Button from "../UI/Button";
import { useState } from "react";
import { useToastStore } from "../../stores/toastStore";

type SignUpProps = {
    isLogin: boolean;
    setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
};

function SignUp({ isLogin, setIsLogin } : SignUpProps){

    const navigate = useNavigate();
    const auth = useAuthStore();

    const [showPassword, setShowPassword] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false); //drives the submit button's loading state

    const user = {
        name,
        email,
        username: userName,
        password
    }

    const handleFormSubmit = async (e: React.FormEvent) => {

        e.preventDefault(); //prevent default form action

        setIsSubmitting(true);

        try {
            await auth.signUp(user); //queue pending signup, sends otp
            navigate('/verify-email', { state: { email } }); //go to verification step, carry email forward
        } catch (err: any) {
            useToastStore.getState().addToast({
            variant: "error",
            message: err?.response?.data?.message || "Sign up failed, try again",
        });
        } finally {
            setIsSubmitting(false);
        }

    }

    return (

        <>
            {/*component container*/}
            <div className={`
                flex flex-col
                justify-center items-center
                w-[100%] h-[100%]
                absolute top-0 left-0
                transition-all duration-1000 md:duration-500 ease
                md:translate-y-0
                ${isLogin ? 'opacity-[0%] pointer-events-none -translate-y-[400px]' : 
                    'opacity-[100%] translate-y-0'}
                ${isLogin ? '' : 'md:delay-500'}
            `}>

                {/*header (only visible on small and medium screens)*/}
                <h1 className="
                    lg:hidden
                    text-l font-semibold text-[var(--text)]
                    w-[100%]
                    mb-[40px] 
                    px-8
                ">
                    Get started with <br />
                    <span className="
                        text-3xl text-[var(--muted)]
                    ">
                        Andora
                    </span>
                </h1>

                {/*header (only visible on large screens)*/}
                <h1 className="
                    hidden lg:block
                    text-4xl text-[var(--text)] 
                    font-semibold
                    mb-[40px]
                ">Get started with Andora</h1>

                <form className="
                    flex flex-col items-center
                    lg:w-[300px]
                "
                onSubmit={handleFormSubmit}
                >

                    {/*name input*/}
                    <Input type="text" placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    ></Input>

                    {/*email input*/}
                    <Input type="email" placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    ></Input>

                    {/*username input*/}
                    <Input type="text" placeholder="Username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    ></Input>

                    {/*password container*/}
                    <div className="
                        flex
                        w-[100%] h-[40px]
                        border border-[var(--border)]
                        focus:outline-none focus:border-[var(--input-bg-f)]
                        rounded-[5px] overflow-hidden
                    "
                    tabIndex={0}>

                        {/*password input*/}
                        <Input type={showPassword ? "text" : "password"} placeholder="Password" className="
                            flex
                            rounded-none border-none
                            w-[100%] h-[100%] m-0
                            text-[--cta-bg]
                        "
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        ></Input>

                        {/*password visibility toggle button, clicks dont matter here so no preventMultipleClicks*/}
                        <Button type="button" className="
                            lg:pb-[0.4rem] pl-[0.1rem]
                            h-[100%] w-[50px] lg:w-[50px]
                            rounded-none
                        " onClick={()=>{setShowPassword(prev=>!prev)}}>

                            {/*close eye svg*/}
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

                            {/*open eye svg*/}
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

                    {/*sign in button, loading is controlled from here since submit buttons dont fire onClick*/}
                    <Button type="submit" loading={isSubmitting} className="
                        mt-[30px] mb-[20px]
                    "
                    >SIGN UP</Button>

                    {/*switch sign out/sign in (only visible on small screens)*/}
                    <span className="
                        md:hidden
                        text-xs text-[var(--muted)]
                    ">
                        Already have an account? <button type = "button" className="
                            text-[var(--panel-sub)] hover:text-[var(--accent)]
                        " onClick={() => setIsLogin((prev : boolean) => !prev)}>Sign in</button>
                    </span>

                </form>

            </div>
        
        </>

    )

}

export default SignUp;