import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VerificationUI from "./VerificationUI";
import { useAuthStore } from "../stores/authStore";
import { getSignupStatus } from "../services/authService";

export default function SignupVerification(){

    const location = useLocation();
    const navigate = useNavigate();
    const auth = useAuthStore();

    const [email, setEmail] = useState<string | null>(location.state?.email ?? null);
    const [isChecking, setIsChecking] = useState(!location.state?.email);

    //recover email from the signup_verify cookie on refresh, where router state is lost
    useEffect(() => {
        if (email) return;

        const checkStatus = async () => {
            try {
                const response = await getSignupStatus();
                if (response.data.pending) {
                    setEmail(response.data.email);
                } else {
                    navigate('/auth'); //nothing pending, send them back to start
                }
            } catch (err) {
                console.error("Failed to check signup status:", err);
                navigate('/auth');
            } finally {
                setIsChecking(false);
            }
        };

        checkStatus();
    }, [email, navigate]);

    if (isChecking) return null; //or a loading spinner if you have one

    return (
        <VerificationUI
            title="Verify Your Email"
            instruction="One last step"
            emailTarget={email ?? undefined}
            onVerify={auth.verifySignup}
            onResend={() => auth.resendSignup(email!)}
            onSuccess={() => navigate('/chat')}
        />
    );
}