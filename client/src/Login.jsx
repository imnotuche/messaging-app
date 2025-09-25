import Usersvg from "./assets/user.svg";

function Login() {
  return (
    <div className="flex justify-center items-center h-screen login">
      <div className="flex bg-white rounded-3xl shadow-[0_6px_24px_0_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.08)]">
        <div className="w-[350px] h-[700px] bg-gradient-to-b from-[#02054eb2] via-[#02044e] to-[#02054eb2] rounded-tl-3xl rounded-bl-3xl rounded-tr-[150px] rounded-br-[150px] justify-between">
          {/* <div>Logo</div> */}
          <div className="flex flex-col justify-center items-center h-[80vh] gap-12 text-white">
            <div className="text-[100px] font-extrabold">と</div>
            <div className="text-center text-4xl font-bold ">Welcome Back!</div>
            <div>
              <p className="text-center">
                To keep connected with us login with your personal details
              </p>
            </div>
            <div>
              <button className="border-2 px-20 py-5 rounded-4xl ">
                SIGN IN
              </button>
            </div>
          </div>
        </div>
        <div className="w-[620px] h-[700px] bg-white rounded-tr-3xl rounded-br-3xl">
          <div className="flex flex-col justify-center items-center text-[#02044e] p-8 gap-6">
            <div className="text-4xl font-semibold">
              <p>Create Account</p>
            </div>

            <div className="w-[100px] h-[100px] rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)] flex justify-center items-center">
              <img src={Usersvg} alt="user" className="w-12" />
            </div>
            <div className="flex flex-col gap-8 mt-10">
              <div>
                <input
                  type="text"
                  className="bg-[#f4f8f7] w-[360px] h-[65px] shadow-[0_6px_24px_0_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.08)]"
                />
              </div>

              <div>
                <input
                  type="text"   
                  className="bg-[#f4f8f7] w-[360px] h-[65px] shadow-[0_6px_24px_0_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.08)]"
                />
              </div>

              <div>
                <input
                  type="text"
                  className="bg-[#f4f8f7] w-[360px] h-[65px] shadow-[0_6px_24px_0_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.08)]"
                />
              </div>
            </div>
            <div>
              <button className="border-2 px-20 py-5 rounded-4xl ">
                SIGN UP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
