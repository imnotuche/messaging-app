import { useEffect, useRef, useState } from "react";

type UseDelayedLoadingOptions = {
    showDelay?: number;   // ms to wait before showing the loader at all
    minDuration?: number; // ms to keep it visible once shown, prevents flicker
};

export function useDelayedLoading(
    isLoading: boolean,
    { showDelay = 150, minDuration = 400 }: UseDelayedLoadingOptions = {}
) {
    const [shouldShow, setShouldShow] = useState(false);
    const shownAtRef = useRef<number | null>(null);

    useEffect(() => {
        let showTimer: ReturnType<typeof setTimeout> | null = null;
        let hideTimer: ReturnType<typeof setTimeout> | null = null;

        if (isLoading) {
            // only start showing after showDelay, if the request finishes
            // before this fires, the cleanup below cancels it and nothing flashes
            showTimer = setTimeout(() => {
                shownAtRef.current = Date.now();
                setShouldShow(true);
            }, showDelay);
        } else if (shownAtRef.current !== null) {
            // loader is currently visible, respect the minimum duration before hiding
            const elapsed = Date.now() - shownAtRef.current;
            const remaining = Math.max(0, minDuration - elapsed);
            hideTimer = setTimeout(() => {
                setShouldShow(false);
                shownAtRef.current = null;
            }, remaining);
        } else {
            setShouldShow(false);
        }

        return () => {
            if (showTimer) clearTimeout(showTimer);
            if (hideTimer) clearTimeout(hideTimer);
        };
    }, [isLoading, showDelay, minDuration]);

    return shouldShow;
}