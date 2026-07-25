import React, { useEffect, useRef, useState } from "react";

type OrbitAnimationOptions = {
    size: number;
    ballColor: string;
    trailLength?: number;
    speed?: number;
    glow?: boolean;
};

function useOrbitAnimation(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    { size, ballColor, trailLength = 12, speed = 0.075, glow = true }: OrbitAnimationOptions
) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        // canvas fillStyle cannot parse currentColor or var() on its own,
        // resolve both manually against the canvas's computed style
        let resolvedColor = ballColor;
        if (ballColor === "currentColor") {
            resolvedColor = getComputedStyle(canvas).color;
        } else if (ballColor.startsWith("var(")) {
            const varName = ballColor.slice(4, -1).trim();
            resolvedColor = getComputedStyle(canvas).getPropertyValue(varName).trim();
        }

        // fallback in case the css variable resolved to an empty string,
        // avoids silently drawing nothing with no error
        if (!resolvedColor) {
            resolvedColor = "#888888";
        }

        const centerX = size / 2;
        const centerY = size / 2;
        const semiMajorAxis = size * 0.4;
        const semiMinorAxis = size * 0.12;
        const ballRadius = Math.max(1.5, size * 0.04);

        let animationFrameId: number;
        let t = 0;

        // trail history instead of a fillRect fade wash, so it works on
        // transparent backgrounds and survives theme toggles
        const trail1: { x: number; y: number }[] = [];
        const trail2: { x: number; y: number }[] = [];

        const drawTrail = (trail: { x: number; y: number }[]) => {
            for (let i = trail.length - 1; i >= 0; i--) {
                const p = trail[i];
                const alpha = 1 - i / trailLength;
                ctx.beginPath();
                ctx.arc(p.x, p.y, ballRadius * (0.5 + 0.5 * alpha), 0, Math.PI * 2);
                ctx.fillStyle = resolvedColor;
                ctx.globalAlpha = alpha;
                // glow only on the lead point, and skip it entirely below ~28px,
                // it just turns into a blurry smudge at button-icon sizes
                if (glow && i === 0) {
                    ctx.shadowColor = resolvedColor;
                    ctx.shadowBlur = ballRadius * 1.5;
                } else {
                    ctx.shadowBlur = 0;
                }
                ctx.fill();
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, size, size);

            // fixed sub-step size keeps trail point spacing constant regardless of
            // how large "speed" is, that's what actually fixes choppiness at high speed
            const subSteps = Math.max(1, Math.ceil(speed / 0.02));
            const stepSize = speed / subSteps;

            for (let i = 0; i < subSteps; i++) {
                t += stepSize;
                const speedOffset = 0.5 * Math.sin(t);
                const angle = t + speedOffset;

                const xOffset = semiMajorAxis * Math.cos(angle);
                const yOffset = semiMinorAxis * Math.sin(angle);

                trail1.unshift({ x: centerX + xOffset, y: centerY + yOffset });
                trail2.unshift({ x: centerX - xOffset, y: centerY - yOffset });
            }
            if (trail1.length > trailLength) trail1.length = trailLength;
            if (trail2.length > trailLength) trail2.length = trailLength;

            drawTrail(trail1);
            drawTrail(trail2);

            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => cancelAnimationFrame(animationFrameId);
    }, [canvasRef, size, ballColor, trailLength, speed, glow]);
}

// ---------- full page loader ----------

type LoadingPageAnimationProps = {
    ballColor?: string;
    className?: string;
    minSize?: number;
    maxSize?: number;
};

export const LoadingPageAnimation: React.FC<LoadingPageAnimationProps> = ({
    ballColor = "#bcaf24",
    className = "",
    minSize = 60,
    maxSize = 120,
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [size, setSize] = useState(minSize);

    useEffect(() => {
        // scale with viewport instead of a hardcoded pixel size, clamped so it
        // doesn't look tiny on a wide monitor or huge on a phone
        const computeSize = () => {
            const target = window.innerWidth * 0.15;
            setSize(Math.min(maxSize, Math.max(minSize, target)));
        };
        computeSize();
        window.addEventListener("resize", computeSize);
        return () => window.removeEventListener("resize", computeSize);
    }, [minSize, maxSize]);

    useOrbitAnimation(canvasRef, { size, ballColor, trailLength: 24, speed: 0.075, glow: true });

    return (
        <div className={`flex items-center justify-center w-full h-full ${className}`}>
            <canvas ref={canvasRef} style={{ width: size, height: size }} />
        </div>
    );
};

// ---------- button spinner ----------

type LoadingButtonAnimationProps = {
    size?: number;
    ballColor?: string;
};

export const LoadingButtonAnimation: React.FC<LoadingButtonAnimationProps> = ({
    size = 18,
    ballColor = "currentColor",
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useOrbitAnimation(canvasRef, { size, ballColor, trailLength: 14, speed: 0.09, glow: false });

    return (
        <canvas
            ref={canvasRef}
            style={{ width: size, height: size, display: "inline-block", verticalAlign: "middle" }}
        />
    );
};