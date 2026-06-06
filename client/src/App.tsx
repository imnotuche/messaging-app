import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";

import { useAuthStore } from "./stores/authStore";
import ProtectedLayout from "./components/ProtectedLayout";
import Auth from "./components/Auth/Auth";
import ChatUI from "./components/ChatUI/ChatUI";

function App() {

    const auth = useAuthStore()

    useEffect( () => {

        (async () => {
            auth.checkAuth()
        })()

    }, [])

    if (auth.isLoading) return null;

    return (
    
        <>
        
            <Routes>

                <Route
                    path="auth"
                    element={auth.isAuthenticated ? <Navigate to="/chat" /> : <Auth />}
                />
                <Route path="/" element={<Navigate to="/auth" />} />

                <Route element={<ProtectedLayout isAuthenticated = {auth.isAuthenticated} />}>
                    <Route path="chat" element={<ChatUI/>} />
                </Route>

            </Routes>
        
        </>
    
    )

}

export default App;
