// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, generateToken } from "../../lib/auth";

export async function POST(req: NextRequest) {
    const { username, password } = await req.json();

    const user = await authenticateUser(username, password);
    if (!user) {
        return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const token = generateToken(user);

    const response = NextResponse.json({ message: "Login successful" });

    response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
}
