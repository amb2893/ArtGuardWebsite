import { NextResponse } from "next/server";
import { verifyToken } from "../../../lib/auth";

export async function GET(req: Request) {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ username: null });

    const user = verifyToken(token);
    return NextResponse.json({ username: user?.username || null });
}
