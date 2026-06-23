import { Outlet, Navigate } from "react-router-dom"
import SideBar from "./SideBar"

type ProtectedRouteProps = {
    isAuthenticated: boolean;
    navbar?: boolean
}

function ProtectedLayout({isAuthenticated, navbar}:ProtectedRouteProps){

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    if(navbar){

        return (

            <div className="
                bg-[var(--panel-bg)] 
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

    } else {
        return (
            
            <main className="
                w-screen h-screen
            ">
                <Outlet/>
            </main>

        )
    }

}

export default ProtectedLayout;