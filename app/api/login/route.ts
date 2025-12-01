import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, generateToken } from "../../../lib/auth";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
        }

        console.log("/api/login attempt:", { username });

        const user = await authenticateUser(username, password);

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const token = generateToken(user);

        const res = NextResponse.json({ success: true });
        res.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 30 * 60, // 30 minutes
            path: "/",
        });

        return res;
    } catch (err) {
        console.error("/api/login error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}