import { NextRequest, NextResponse } from "next/server";
import { getPopularForumThreads } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limitParam = searchParams.get("limit");
        const limit = limitParam ? parseInt(limitParam, 10) : 5;

        const threads = await getPopularForumThreads(limit);
        return NextResponse.json(threads);
    } catch (err) {
        console.error("/api/popular-threads GET error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
