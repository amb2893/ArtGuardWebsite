"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Props = {
    loggedIn: boolean;
    username?: string | null;
};

export default function NavBar({ loggedIn, username }: Props) {
    const pathname = usePathname();
    const [currentUser, setCurrentUser] = useState<string | undefined | null>(username);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(loggedIn);

    useEffect(() => {
        let mounted = true;

        async function fetchMe() {
            try {
                const res = await fetch("/api/me", { cache: "no-store" });
                if (!mounted) return;
                if (!res.ok) {
                    setCurrentUser(undefined);
                    setIsLoggedIn(false);
                    return;
                }
                const json = await res.json();
                setCurrentUser(json?.username ?? undefined);
                setIsLoggedIn(Boolean(json?.username));
            } catch (err) {
                if (!mounted) return;
                setCurrentUser(undefined);
                setIsLoggedIn(false);
            }
        }

        // Fetch on mount and whenever pathname changes (so after navigation/logout)
        fetchMe();

        return () => {
            mounted = false;
        };
    }, [pathname]);

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link href="/" className="logo" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield text-rose-400" aria-hidden="true">
                            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                        </svg>
                    </span>
                    <span>ARTGUARD</span>
                </Link>
            </div>

            <div className="navbar-center">
                <Link href="/articles" className="nav-link">
                    ARTICLES
                </Link>
                <Link href="/forums" className="nav-link">
                    FORUMS
                </Link>
                <Link href="/ratings" className="nav-link">
                    RATINGS
                </Link>
            </div>

            <div className="navbar-right">
                {isLoggedIn && currentUser ? (
                    <>
                        <span className="username">Hello, {currentUser}</span>
                        <Link href="/logout" className="button secondary">
                            Logout
                        </Link>
                    </>
                ) : (
                    <Link href="/login" className="button primary">
                        LOGIN
                    </Link>
                )}
            </div>
        </nav>
    );
}
