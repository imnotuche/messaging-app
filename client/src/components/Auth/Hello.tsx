type HelloProps = {
    isLogin: boolean;
};

function Hello({isLogin} : HelloProps) {

    return (

        <>

            <div className={`
                hidden absolute
                md:flex flex-col
                justify-center items-center
                transition-all duration-1000 ease
                ${isLogin ? 'translate-x-0' : 'translate-x-80'}
            `}>

                <h1 className="
                    text-3xl text-[#f0dcc8] font-semibold
                    mb-[10px]
                ">Hello!</h1>

                <p className="
                    text-center md:text-[0.65rem] lg:text-[0.75rem] text-[#f0dcc8]
                    mb-[20px]
                ">
                    Dont have an account ? click below to <br /> start messaging with Andora
                </p>

            </div>

        </>

    )

}

export default Hello;