import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedLayout from "./components/ProtectedLayout";
import Auth from "./components/Auth/Auth";
import ChatUI from "./components/ChatUI/ChatUI";

function App() {

    return (
    
        <>
        
            <Routes>

                <Route path="auth" element={<Auth/>} />
                <Route path="/" element={<Navigate to="/auth" />} />

                <Route element={<ProtectedLayout/>}>
                    <Route path="chat" element={<ChatUI/>} />
                </Route>

            </Routes>
        
        </>
    
    )

}

export default App;
