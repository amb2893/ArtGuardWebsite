import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../lib/auth";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ id: null, username: null });

        const user = verifyToken(token);
        return NextResponse.json({
            id: user?.id ?? null,
            username: user?.username ?? null,
        });
    } catch (err) {
        console.error("/api/me error:", err);
        return NextResponse.json({ id: null, username: null }, { status: 500 });
    }
}
