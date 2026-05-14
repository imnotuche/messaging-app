type HelloProps = {
    isLogin: boolean;
};

function Welcome({isLogin} : HelloProps) {

    return (

        <>

            <div className={`
                hidden absolute
                md:flex flex-col
                justify-center items-center
                transition-all duration-1000 ease
                ${isLogin ? '-translate-x-80' : 'translate-x-0'}
            `}>

                <h1 className="
                    text-3xl md:text-2xl text-[#f0dcc8] font-semibold
                    mb-[10px]
                ">Welcome Back!</h1>

                <p className="
                    text-center md:text-[0.65rem] lg:text-[0.75rem] text-[#f0dcc8]
                    mb-[20px]
                ">
                    Already have an account ? click below <br  />to Sign in
                </p>

            </div>

        </>

    )

}

export default Welcome;