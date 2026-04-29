import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../lib/auth";
import { isAdmin } from "../../../lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ username: null, isAdmin: false });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ username: null, isAdmin: false });

    const admin = await isAdmin(user.id);
    return NextResponse.json({ username: user.username, isAdmin: admin });
  } catch (err) {
    console.error("/api/me error:", err);
    return NextResponse.json({ username: null, isAdmin: false }, { status: 500 });
  }
}
