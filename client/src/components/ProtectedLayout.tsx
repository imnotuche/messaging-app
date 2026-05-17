import { Outlet } from "react-router-dom"
import SideBar from "./SideBar"

function ProtectedLayout(){

    return (

        <div className="flex">

            <div className="
                bg-[#240f04]
                flex
                w-screen h-screen
            ">
                
                <SideBar/>
                <main className="
                    flex flex-1
                    h-[100%] w-[100%]
                ">
                    <Outlet/>
                </main>

            </div>

        </div>

    )

}

export default ProtectedLayout;