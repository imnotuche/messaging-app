import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GridBg from "./UI/GridBg";
import Input from "./UI/Input";
import Button from "./UI/Button";
import VerificationUI from "./VerificationUI";
import { useAuthStore } from "../stores/authStore";

type Step = "request" | "verify" | "reset";

export default function ForgotPassword(){

    const navigate = useNavigate();
    const auth = useAuthStore();

    const [step, setStep] = useState<Step>("request");
    const [identifier, setIdentifier] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    //step 1: request a code sent to email or username
    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setErrorMessage("");

        try {
            await auth.sendReset(identifier.trim());
            setStep("verify");
        } catch (err: any) {
            console.error("Failed to send reset code:", err);
            setErrorMessage(err?.response?.data?.message || "Couldn't send reset code");
        } finally {
            setIsSubmitting(false);
        }
    };

    //step 2: verify the code, VerificationUI handles its own submit/resend UI internally
    const handleVerify = async (code: string) => {
        await auth.verifyReset(code);
    };

    const handleResend = async () => {
        await auth.sendReset(identifier.trim());
    };

    //step 3: set the new password
    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (newPassword !== confirmPassword) {
            setErrorMessage("Passwords don't match");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");

        try {
            await auth.completeReset(newPassword);
            navigate('/auth'); //go log in manually with the new password
        } catch (err: any) {
            console.error("Failed to reset password:", err);
            setErrorMessage(err?.response?.data?.message || "Couldn't reset password");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (step === "verify") {
        return (
            <VerificationUI
                title="Verify Your Identity"
                instruction="Password reset"
                emailTarget={identifier}
                onVerify={handleVerify}
                onResend={handleResend}
                onSuccess={() => setStep("reset")}
            />
        );
    }

    if (step === "reset") {
        return (
            <GridBg className="
                flex
                justify-center items-center 
                w-screen h-dvh px-4
            ">

                <div className="
                    relative z-10
                    flex flex-col items-center
                    w-full max-w-[340px]
                    p-8
                    border border-[var(--border)] bg-[var(--form-bg)]
                    rounded-[10px]
                "
                style={{ boxShadow: "var(--card-shadow)" }}>

                    <h1 className="text-2xl text-[var(--text)] font-semibold mb-[20px]">Set New Password</h1>

                    <form className="flex flex-col items-center w-full" onSubmit={handleResetSubmit}>

                        <Input type="password" placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        ></Input>

                        <Input type="password" placeholder="Confirm password" className="mt-3"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        ></Input>

                        {errorMessage && (
                            <p className="text-xs text-red-500 mt-4">{errorMessage}</p>
                        )}

                        <Button type="submit" disabled={isSubmitting} className="mt-[30px] mb-[10px]">
                            {isSubmitting ? "RESETTING..." : "RESET PASSWORD"}
                        </Button>

                    </form>

                </div>
            </GridBg>
        );
    }

    //step === "request"
    return (
        <GridBg className="flex justify-center items-center w-screen h-dvh px-4">

            <div className="
                relative z-10
                flex flex-col items-center
                w-full max-w-[340px]
                p-8
                border border-[var(--border)] bg-[var(--form-bg)]
                rounded-[10px]
            "
            style={{ boxShadow: "var(--card-shadow)" }}>

                <h1 className="text-2xl text-[var(--text)] font-semibold mb-[10px]">Forgot Password?</h1>
                <p className="text-xs text-[var(--muted)] mb-[20px] text-center">Enter your email or username and we'll send a code</p>

                <form className="flex flex-col items-center w-full" onSubmit={handleRequestSubmit}>

                    <Input type="text" placeholder="Email or username"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                    ></Input>

                    {errorMessage && (
                        <p className="text-xs text-red-500 mt-4">{errorMessage}</p>
                    )}

                    <Button type="submit" disabled={isSubmitting} className="mt-[30px] mb-[10px]">
                        {isSubmitting ? "SENDING..." : "SEND CODE"}
                    </Button>

                </form>

                <button
                    type="button"
                    onClick={() => navigate('/auth')}
                    className="text-xs text-[var(--muted)] hover:text-[var(--accent)] underline bg-transparent border-none cursor-pointer"
                >
                    Back to sign in
                </button>

            </div>
        </GridBg>
    );

}