// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateUser } from "../../lib/auth";

export async function POST(req: NextRequest) {
    const { username, password } = await req.json();

    const user = await validateUser(username, password);
    if (!user) {
        return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const response = NextResponse.json({ message: "Login successful" });

    response.cookies.set({
        name: "token",
        value: user.token,
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
}
