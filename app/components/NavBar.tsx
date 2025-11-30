"use client";

import Link from "next/link";
import React from "react";

export default function NavBar({ loggedIn, username }: { loggedIn: boolean; username?: string }) {
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
                {loggedIn ? (
                    <>
                        <span className="username">Hello, {username}</span>
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
