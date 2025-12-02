import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const res = NextResponse.json({ ok: true });
        // Clear cookie by setting it empty and maxAge=0 (expires immediately)
        res.cookies.set("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 0,
            path: "/",
        });
        return res;
    } catch (err) {
        console.error("/api/logout error:", err);
        return NextResponse.json({ error: "Logout failed" }, { status: 500 });
    }
}