// components/UI/Toast.tsx
import { useEffect, useRef, useState } from "react";
import { useToastStore, type ToastItem } from "../../stores/toastStore";

type ToastProps = {
    toast: ToastItem;
};

// grow-in / shrink-out: three properties animate concurrently from the same
// trigger, each with its own duration, that's what creates the overlap.
// opacity finishes first, height second (reads as "the circle"), width last.
const OPACITY_MS = 90;
const CIRCLE_MS = 180;
const WIDTH_MS = 320;

// height-in / height-out: sequential stage, pill height -> full toast height
const HEIGHT_EXPAND_MS = 260;

const CONTENT_MS = 150;

// back-out bezier, overshoots past the target then settles
const BOUNCE = "cubic-bezier(0.34, 1.56, 0.64, 1)";

type Phase =
    | "hidden"      // 0x0, invisible, pre-mount state
    | "grow-in"     // 0 -> full width, 0 -> pill height, 0 -> full opacity, concurrent
    | "height-in"   // pill height -> full toast height, rounded-rect
    | "idle"        // settled, content visible, countdown running
    | "content-out" // fading content before collapsing back
    | "height-out"  // full toast height -> pill height
    | "shrink-out"; // full width/pill height/opacity -> 0, concurrent, mirrors grow-in

const FULL_WIDTH = 320;
const PILL_HEIGHT = 34;
const FULL_HEIGHT = 56;

const variantDot: Record<ToastItem["variant"], string> = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    default: "bg-[var(--accent)]",
};

function Toast({ toast }: ToastProps) {
    const removeToast = useToastStore((s) => s.removeToast);
    const startExit = useToastStore((s) => s.startExit);

    const [phase, setPhase] = useState<Phase>("hidden");

    // tracks time left on the auto-dismiss countdown across hover pauses
    const remainingRef = useRef(toast.duration);
    const timerStartRef = useRef<number>(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // entry: hidden -> grow-in -> height-in -> idle
    useEffect(() => {
        const t = setTimeout(() => setPhase("grow-in"), 20); //next tick so hidden state actually paints first
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (phase !== "grow-in") return;
        const t = setTimeout(() => setPhase("height-in"), WIDTH_MS); //waits for the longest of the concurrent three
        return () => clearTimeout(t);
    }, [phase]);

    useEffect(() => {
        if (phase !== "height-in") return;
        const t = setTimeout(() => setPhase("idle"), HEIGHT_EXPAND_MS);
        return () => clearTimeout(t);
    }, [phase]);

    //auto dismiss countdown, only runs once fully idle
    useEffect(() => {
        if (phase !== "idle") return;

        timerStartRef.current = Date.now();
        timeoutRef.current = setTimeout(() => startExit(toast.id), remainingRef.current);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [phase, startExit, toast.id]);

    const handleMouseEnter = () => {
        if (phase !== "idle" || !timeoutRef.current) return;
        clearTimeout(timeoutRef.current);
        remainingRef.current -= Date.now() - timerStartRef.current;
    };

    const handleMouseLeave = () => {
        if (phase !== "idle") return;
        timerStartRef.current = Date.now();
        timeoutRef.current = setTimeout(() => startExit(toast.id), Math.max(remainingRef.current, 0));
    };

    //store flips status to exiting for three reasons: timeout, cancel click,
    //or getting pushed out by the max-3 limit, all of them land here
    useEffect(() => {
        if (toast.status !== "exiting") return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setPhase("content-out");
    }, [toast.status]);

    // exit: content-out -> height-out -> shrink-out, mirrors the entry sequence
    useEffect(() => {
        if (phase !== "content-out") return;
        const t = setTimeout(() => setPhase("height-out"), CONTENT_MS);
        return () => clearTimeout(t);
    }, [phase]);

    useEffect(() => {
        if (phase !== "height-out") return;
        const t = setTimeout(() => setPhase("shrink-out"), HEIGHT_EXPAND_MS);
        return () => clearTimeout(t);
    }, [phase]);

    useEffect(() => {
        if (phase !== "shrink-out") return;
        const t = setTimeout(() => removeToast(toast.id), WIDTH_MS);
        return () => clearTimeout(t);
    }, [phase, removeToast, toast.id]);

    // target box dimensions per phase, css transitions interpolate automatically
    // toward whatever target the current phase specifies
    const isTall = phase === "height-in" || phase === "idle" || phase === "content-out";
    const isGrown = phase !== "hidden" && phase !== "shrink-out";

    const width = isGrown ? FULL_WIDTH : 0;
    const height = isGrown ? (isTall ? FULL_HEIGHT : PILL_HEIGHT) : 0;
    const boxOpacity = isGrown ? 1 : 0;
    const radius = isTall ? 22 : height / 2; //perfect pill while short, fixed rounded-rect once tall

    // two duration profiles: concurrent-overlap (grow-in/shrink-out) vs
    // sequential height-only (height-in/height-out)
    const isOverlapStage = phase === "grow-in" || phase === "shrink-out";
    const widthDuration = isOverlapStage ? WIDTH_MS : 0;
    const heightDuration = isOverlapStage ? CIRCLE_MS : HEIGHT_EXPAND_MS;
    const opacityDuration = isOverlapStage ? OPACITY_MS : 0;

    const showContent = phase === "idle";

    return (

        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="overflow-hidden bg-[var(--form-bg)] border border-[var(--card-border)]"
            style={{
                width: `${width}px`,
                height: `${height}px`,
                opacity: boxOpacity,
                borderRadius: `${radius}px`,
                boxShadow: "var(--card-shadow)",
                transitionProperty: "width, height, opacity, border-radius",
                transitionDuration: `${widthDuration}ms, ${heightDuration}ms, ${opacityDuration}ms, ${heightDuration}ms`,
                transitionTimingFunction: `${BOUNCE}, ${BOUNCE}, ease-out, ${BOUNCE}`,
            }}
        >

            <div className={`
                flex items-center gap-3
                w-[320px] h-[56px] px-4 py-2.5
                transition-opacity ease-out
                ${showContent ? "opacity-100" : "opacity-0"}
            `}
            style={{ transitionDuration: `${CONTENT_MS}ms` }}>

                <div className={`
                    mt-1 shrink-0
                    w-2 h-2 rounded-full
                    ${variantDot[toast.variant]}
                `} />

                <div className="min-w-0 flex-1">
                    {toast.title && (
                        <div className="text-sm font-semibold text-[var(--text)] mb-0.5 truncate">{toast.title}</div>
                    )}
                    <div className="text-xs text-[var(--muted)] leading-relaxed line-clamp-2">{toast.message}</div>
                </div>

                <button
                    type="button"
                    onClick={() => startExit(toast.id)}
                    className="
                        shrink-0 text-[var(--muted)] hover:text-[var(--text)]
                        transition-colors cursor-pointer
                    "
                    aria-label="dismiss notification"
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>

            </div>

        </div>

    );

}

export default Toast;