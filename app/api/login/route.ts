import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, generateToken } from "../../../lib/auth";
import { apiErrorResponse } from "../../../lib/apiErrors";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null);
        if (!body || typeof body !== "object") {
            return NextResponse.json({ error: "Invalid request body", cause: "Malformed JSON payload" }, { status: 400 });
        }
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
        }

        console.log("/api/login attempt:", { username });

        let user;
        try {
            user = await authenticateUser(username, password);
        } catch (err: any) {
            if (err?.code === "ACCOUNT_BANNED") {
                return NextResponse.json({ error: "Your account has been banned." }, { status: 403 });
            }
            throw err;
        }

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
        return apiErrorResponse("/api/login", err, "Internal server error");
    }
}