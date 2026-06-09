import { twMerge } from "tailwind-merge";
type DivBgProps = React.HTMLAttributes<HTMLDivElement>;

const R = 36;
const W = 3 * R;
const H = Math.sqrt(3) * R;

function hexPath(cx: number, cy: number, r: number): string {
    const pts = Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 180) * (60 * i);
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    });
    return `M ${pts[0]} ${pts.slice(1).map(p => `L ${p}`).join(" ")} Z`;
}

const hex1 = { cx: 0,       cy: 0     };
const hex2 = { cx: 1.5 * R, cy: H / 2 };

export default function GridBg({
    children,
    className = "",
    ...props
}: DivBgProps) {
    const strokeW = 1.2;

    return (
        <div {...props} className={twMerge(`bg-[var(--bg)]`, className)}>
            <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <clipPath id="clipA">
                        <path d={hexPath(hex1.cx, hex1.cy, R)} />
                    </clipPath>
                    <clipPath id="clipB">
                        <path d={hexPath(hex2.cx, hex2.cy, R)} />
                    </clipPath>
                    <clipPath id="clipC">
                        <path d={hexPath(3 * R, 0, R)} />
                    </clipPath>

                    <pattern
                        id="hexInterlocked"
                        x="0"
                        y="0"
                        width={W}
                        height={H}
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d={hexPath(hex1.cx, hex1.cy, R)}
                            fill="none"
                            stroke="var(--grid-stroke)"
                            strokeWidth={strokeW * 2}
                            clipPath="url(#clipA)"
                            opacity="1"
                        />
                        <path
                            d={hexPath(hex2.cx, hex2.cy, R)}
                            fill="none"
                            stroke="var(--grid-stroke)"
                            strokeWidth={strokeW * 2}
                            clipPath="url(#clipB)"
                            opacity="1"
                        />
                        <path
                            d={hexPath(3 * R, 0, R)}
                            fill="none"
                            stroke="var(--grid-stroke)"
                            strokeWidth={strokeW * 2}
                            clipPath="url(#clipC)"
                            opacity="1"
                        />
                    </pattern>
                </defs>

                <rect width="100%" height="100%" fill="url(#hexInterlocked)" />
            </svg>

            {children}
        </div>
    );
}