import { NextRequest, NextResponse } from "next/server";
import { createUser, generateToken, } from "../../../lib/auth";
import { getPasswordIssues } from "../../../lib/passwordRules";
import { apiErrorResponse } from "../../../lib/apiErrors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const username = String(body.username || "").trim();
    const password = String(body.password || "");
    const confirmPassword = String(body.confirmPassword || "");

    if (!username || !password || !confirmPassword) {
      return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    const issues = getPasswordIssues(password);
    if (issues.length > 0) {
      return NextResponse.json(
        { error: "Password does not meet requirements", issues },
        { status: 400 }
      );
    }

    const user = await createUser(username, password);
    const token = generateToken(user);

    const res = NextResponse.json({ success: true }, { status: 201 });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (err: any) {
    if (err?.code === "USER_EXISTS" || err?.message === "USER_EXISTS") {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }
    return apiErrorResponse("/api/signup", err, "Internal server error");
  }
}