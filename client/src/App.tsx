import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./stores/authStore";
import { useSettingsStore } from "./stores/settingsStore";
import { connectSocket, disconnectSocket } from "./socket";
import ProtectedLayout from "./components/ProtectedLayout";
import Auth from "./components/Auth/Auth";
import ChatUI from "./components/ChatUI/ChatUI";
import SignupVerification from "./components/SignUpVerification";
import SettingsPage from "./components/SettingsUI/SettingsPage";
import UserProfile from "./components/UserProfile";
import AllFriends from "./components/AllFriends";
import Search from "./components/Search";
import ForgotPassword from "./components/ForgotPassword";

function App() {
    const auth = useAuthStore()
    const settings = useSettingsStore()

    useEffect( () => {
        (async () => {
            auth.checkAuth()
        })()
    }, [])

    // Sync the dark class onto <html> on initial mount, since index.html no longer hardcodes it
    useEffect(() => {
        document.documentElement.classList.toggle("dark", settings.dark);
    }, [])

    //connect once authenticated, disconnect on logout, not just on unmount
    useEffect(() => {
        if (auth.isAuthenticated) {
            console.log("attempting socket connection now"); //temporary debug line
            connectSocket();
        } else {
            disconnectSocket();
        }
    }, [auth.isAuthenticated]);

    if (auth.isLoading) return null;

    return (
    
        <>
        
            <Routes>

                <Route
                    path="auth"
                    element={auth.isAuthenticated ? <Navigate to="/chat" /> : <Auth />}
                />

                <Route path="/" element={<Navigate to="/auth" />} />
                <Route path="verify-email" element={<SignupVerification />} />
                <Route path="forgot-password" element={<ForgotPassword />} />

                <Route element={<ProtectedLayout isAuthenticated = {auth.isAuthenticated} navbar = {true} />}>
                    <Route path="chat" element={<ChatUI/>} />
                    <Route path="settings" element={<SettingsPage/>} />
                    <Route path="friends" element={<AllFriends/>} />
                    
                    {/* Captures parameters like "1" or dynamically */}
                    <Route path="friends/:id" element={<UserProfile/>} />
                    
                    <Route path="search" element={<Search/>} />
                </Route>

            </Routes>
        
        </>
    
    )
}
export default App;