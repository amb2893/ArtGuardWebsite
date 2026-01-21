"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await fetch("/api/logout", {
                    method: "POST",
                    credentials: "same-origin",
                });

                if (!mounted) return;

                if (res.ok) {
                    router.push("/");
                } else {
                    let msg = "Logout failed";
                    try {
                        const json = await res.json();
                        msg = json?.error || msg;
                    } catch {}
                    setError(msg);
                }
            } catch (err) {
                console.error("Logout request failed", err);
                if (mounted) setError("Network error during logout");
            }
        })();

        return () => {
            mounted = false;
        };
    }, [router]);

    return (
        <div style={{ padding: 40 }}>
            <h1>Logging out...</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}