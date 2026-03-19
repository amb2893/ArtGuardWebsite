import { NextRequest, NextResponse } from "next/server";
import { getPopularWebsites } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limitParam = searchParams.get("limit");
        const limit = limitParam ? parseInt(limitParam, 10) : 5;

        const websites = await getPopularWebsites(limit);
        return NextResponse.json(websites);
    } catch (err) {
        console.error("/api/popular-websites GET error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
