function Welcome() {

    return (

        <>

            <div className="
                hidden
                md:flex flex-col
                justify-center items-center
            ">

                <h1 className="
                    text-3xl md:text-2xl text-[#f0dcc8] font-semibold
                    mb-[10px]
                ">Welcome Back!</h1>

                <p className="
                    text-center md:text-xs lg:text-l text-[#f0dcc8]
                    mb-[20px]
                ">
                    Already have an account ? click below to <br className="hidden lg:block" /> Sign in
                </p>

            </div>

        </>

    )

}

export default Welcome;