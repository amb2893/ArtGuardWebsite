// app/api/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../lib/auth";

export async function POST(req: NextRequest) {
    try {
        // read token from request cookies
        const cookieHeader = req.headers.get("cookie") ?? "";
        const match = cookieHeader.match(/token=([^;]+)/);
        const token = match?.[1];

        if (!token) return NextResponse.json({ ok: false }, { status: 401 });

        const user = verifyToken(token);
        if (!user) return NextResponse.json({ ok: false }, { status: 401 });

        const res = NextResponse.json({ ok: true });
        res.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 30 * 60, // 30 minutes sliding window
            path: "/",
        });

        return res;
    } catch (err) {
        console.error("/api/refresh error:", err);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
