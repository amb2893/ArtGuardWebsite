// app/layout.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import React from "react";
import NavBar from "./components/NavBar";
import "../styles/globals.css";


export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // cookies() now returns a Promise, so await it
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value ?? null;
    const loggedIn = Boolean(token);

    return (
        <html lang="en">
            <body>
                <NavBar loggedIn={loggedIn} />
                <main>{children}</main>
            </body>
        </html>
    );
}
