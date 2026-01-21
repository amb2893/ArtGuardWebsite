"use client";

import { useEffect, useRef } from "react";

export default function ActivityMonitor() {
    const lastCall = useRef<number>(0);
    // throttle refresh calls to at most once per minute
    const THROTTLE_MS = 60_000;

    useEffect(() => {
        let mounted = true;

        const sendRefresh = async () => {
            const now = Date.now();
            if (now - lastCall.current < THROTTLE_MS) return;
            lastCall.current = now;

            try {
                await fetch("/api/refresh", {
                    method: "POST",
                    credentials: "same-origin",
                });
            } catch (err) {
                // swallow errors; server will clear cookie when invalid
                // console.debug("refresh failed", err);
            }
        };

        const onActivity = () => {
            if (!mounted) return;
            sendRefresh();
        };

        // user activity events that should keep session alive
        const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];

        events.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));

        // optionally refresh on mount so initial page activity resets timer
        sendRefresh();

        return () => {
            mounted = false;
            events.forEach((ev) => window.removeEventListener(ev, onActivity));
        };
    }, []);

    return null;
}