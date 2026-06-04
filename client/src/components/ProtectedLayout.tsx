import { Outlet, Navigate } from "react-router-dom"
import SideBar from "./SideBar"

type ProtectedRouteProps = {
    isAuthenticated: boolean;
}

function ProtectedLayout({isAuthenticated}:ProtectedRouteProps){

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    return (

        <div className="
            bg-[#240f04] 
            flex flex-col-reverse lg:flex-row
            w-screen h-screen
        ">
            
            <SideBar/>
            <main className="
                flex flex-1
                h-[calc(100%-56px)] lg:h-full w-full
            ">
                <Outlet/>
            </main>

        </div>

    )

}

export default ProtectedLayout;