import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./stores/authStore";
import { useSettingsStore } from "./stores/settingsStore";
import ProtectedLayout from "./components/ProtectedLayout";
import Auth from "./components/Auth/Auth";
import ChatUI from "./components/ChatUI/ChatUI";
import VerificationUI from "./components/VerificationUI";
import SettingsPage from "./components/SettingsUI/SettingsPage";
import UserProfile from "./components/UserProfile";
import AllFriends from "./components/AllFriends";
import Search from "./components/Search";
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

    if (auth.isLoading) return null;
    return (
    
        <>
        
            <Routes>
                <Route
                    path="auth"
                    element={auth.isAuthenticated ? <Navigate to="/chat" /> : <Auth />}
                />
                <Route path="/" element={<Navigate to="/auth" />} />
                <Route element={<ProtectedLayout isAuthenticated = {auth.isAuthenticated} navbar = {false} />}>
                    <Route path="verify" element={<VerificationUI title = {""} instruction ={""} />} />
                </Route>
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