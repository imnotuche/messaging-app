import { useEffect, useState, useRef, type ChangeEvent, type KeyboardEvent, type ClipboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import GridBg from "./UI/GridBg";
import Input from "./UI/Input";
import Button from "./UI/Button";

type VerificationProps = {
    title: string;
    instruction: string;
    emailTarget?: string;
}

export default function VerificationUI({title, instruction, emailTarget = "you@email.com"}: VerificationProps){
    const navigate = useNavigate();

    // State to hold the 6 individual characters
    const [code, setCode] = useState<string[]>(Array(6).fill(""));

    // Track which input index currently holds active focus to ensure visual border accuracy
    const [focusedIndex, setFocusedIndex] = useState<number | null>(0);

    // Resend action state logic
    const [resendText, setResendText] = useState("RESEND CODE");
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    
    // Array of refs to control the focus of each Input component
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Automatically focus the first input box on component load
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    // Handles number filtering and auto-forward focus / blur
    const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const val = e.target.value.replace(/\D/g, "");

        const newCode = [...code];
        newCode[index] = val.slice(-1);
        setCode(newCode);

        if (val && index < 5) {
            inputRefs.current[index + 1]?.focus();
        } else if (val && index === 5) {
            // Unfocuses the last input box immediately after a digit is entered
            inputRefs.current[index]?.blur();
        }
    };

    // Handles moving backwards when pressing backspace on an empty field
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handles pasting full 6-digit codes effortlessly
    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        
        if (!pasteData) return;

        const newCode = [...code];
        pasteData.split("").forEach((char, idx) => {
            if (idx < 6) newCode[idx] = char;
        });
        setCode(newCode);

        const focusIndex = Math.min(pasteData.length - 1, 5);
        inputRefs.current[focusIndex]?.focus();
    };

    const handleResendClick = () => {
        setResendText("SENT!");
        setIsResendDisabled(true);
        setTimeout(() => {
            setResendText("RESEND CODE");
            setIsResendDisabled(false);
        }, 3000);
    };

    return (
        <GridBg className="
            flex justify-center items-center
            w-screen h-screen
            px-4
        ">
            
            {/*component container*/}
            <div className={`
                relative z-10
                flex flex-col md:flex-row
                w-full max-w-[340px] md:max-w-[820px]
                h-auto md:h-[480px]
                overflow-hidden rounded-[10px] 
                border border-[var(--border)] bg-[var(--form-bg)]
            `}
            style={{
                boxShadow: "var(--card-shadow)"
            }}>
                
                {/*workspace panel*/}
                <div className="
                    flex-1 p-6 md:p-12 
                    flex flex-col justify-between items-start
                    bg-[var(--form-bg)]
                ">
                    {/*back trigger button*/}
                    <button 
                        onClick={() => navigate(-1)}
                        className="
                            flex items-center gap-1.5 p-0 mb-6 md:mb-0 bg-[var(--form-bg)] border-none cursor-pointer
                            text-xs uppercase text-[var(--muted)] hover:text-[var(--text)] transition-colors
                        "
                    >
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        BACK
                    </button>

                    {/*centered content area*/}
                    <div className="
                        max-w-md w-full mx-auto
                        flex flex-col justify-center items-center
                        text-center my-auto
                    ">
                        {/*header metadata label*/}
                        <div className="
                            text-xs uppercase text-[var(--muted)]
                            mb-[10px]
                        ">{instruction}</div>

                        {/*title*/}
                        <h1 className="
                            text-3xl md:text-2xl text-[var(--text)] 
                            font-semibold
                            mb-[10px] w-full
                        ">{title}</h1>

                        <p className="
                            text-center md:text-[0.65rem] lg:text-[0.75rem]
                            text-[var(--text)]
                            mb-[20px]
                        ">Enter the code we sent to <strong className="font-semibold">{emailTarget}</strong></p>

                        {/*otp input collection row*/}
                        <form className="
                            flex gap-2 mb-6 w-full
                            justify-center
                        " onSubmit={(e) => e.preventDefault()}>

                            {code.map((value, index) => (
                                <Input
                                    key={index}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={1}
                                    value={value}
                                    ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el; }}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e, index)}
                                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, index)}
                                    onPaste={index === 0 ? handlePaste : undefined}
                                    onFocus={() => setFocusedIndex(index)}
                                    onBlur={() => setFocusedIndex(null)}
                                    className={`
                                        w-10 h-10 md:w-12 md:h-12
                                        text-xl text-center
                                        font-semibold rounded-[5px] 
                                        border pl-0 focus:outline-none
                                        ${(value !== "" || focusedIndex === index)
                                            ? "bg-[var(--input-bg-f)] border-[var(--border-hi)] text-[var(--text)]" 
                                            : "bg-[var(--input-bg)] border-[var(--border)] text-[var(--muted)]"
                                        }
                                    `}
                                />
                            ))}

                        </form>

                        {/*resend functionality interaction trigger*/}
                        <p className="
                            text-xs text-[var(--muted)]
                            mb-6
                        ">
                            Didn't receive it?{" "}
                            <button 
                                type="button"
                                disabled={isResendDisabled}
                                onClick={handleResendClick}
                                className="
                                    bg-[var(--form-bg)] border-none cursor-pointer 
                                    text-[var(--text)] hover:text-[var(--accent)] underline ml-0.5
                                    disabled:opacity-50 disabled:no-underline
                                "
                            >
                                {resendText}
                            </button>
                        </p>

                        <Button 
                            type="submit"
                            className="
                                mt-[30px] mb-[20px]
                            "
                        >
                            VERIFY &amp; CONTINUE
                        </Button>
                    </div>
                </div>

                {/*sidebar design banner info panel*/}
                <div className="
                    hidden md:flex md:w-[38%] shrink-0 
                    flex-col justify-center items-center 
                    p-3 border-l border-[var(--separator)] bg-[var(--panel-bg)]
                ">

                    <div className="
                        text-center flex flex-col 
                        items-center gap-3 px-4
                    ">
                        
                        <div className="
                            text-3xl text-[var(--panel-text)] 
                            font-semibold
                        ">Check Your Email.</div>
                        
                        <p className="
                            text-center md:text-[0.65rem] lg:text-[0.75rem] 
                            text-[var(--panel-sub)]
                            mb-[20px] leading-relaxed
                        ">We sent a 6-digit code <br /> Enter it to confirm your identity</p>

                    </div>

                </div>

            </div>

        </GridBg>
    );
}