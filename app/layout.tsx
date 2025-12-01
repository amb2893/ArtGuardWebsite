// app/layout.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import React from "react";
import NavBar from "./components/NavBar";
import "../styles/globals.css";
import { verifyToken } from "../lib/auth";
import ActivityMonitor from "./components/ActivityMonitor";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value ?? null;

    // Verify token server-side and extract username (verifyToken is synchronous)
    const user = token ? verifyToken(token) : null;
    const username = user?.username ?? undefined;
    const loggedIn = Boolean(username);

    return (
        <html lang="en">
            <body>
                <NavBar loggedIn={loggedIn} username={username} />
                <ActivityMonitor />
                <main>{children}</main>
            </body>
        </html>
    );
}
