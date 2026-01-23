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
                <Link href="/" className="logo">
                    ArtGuard
                </Link>
            </div>

            <div className="navbar-center">
                <Link href="/articles" className="nav-link">
                    Articles
                </Link>
                <Link href="/forums" className="nav-link">
                    Forums
                </Link>
                <Link href="/ratings" className="nav-link">
                    Ratings
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
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
}
