import { NextRequest, NextResponse } from "next/server";
import { createUser, generateToken } from "../../../lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
    }

    const user = await createUser(String(username), String(password));
    const token = generateToken(user);

    const res = NextResponse.json({ success: true }, { status: 201 });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return res;
  } catch (err: any) {
    if (err?.code === "USER_EXISTS" || err?.message === "USER_EXISTS") {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }
    if (err?.message === "WEAK_PASSWORD") {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    console.error("/api/signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
