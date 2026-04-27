import { NextRequest, NextResponse } from "next/server";
import { getRatingTimeSeries } from "../../../../../lib/db";

export const runtime = "nodejs";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = Number(idParam);
        if (Number.isNaN(id)) {
            return NextResponse.json({ error: "Invalid id" }, { status: 400 });
        }

        const url = new URL(req.url);
        const granularity = url.searchParams.get("granularity") || "monthly";

        // Only allow valid granularity values
        if (!["daily", "weekly", "monthly", "yearly", "all"].includes(granularity)) {
            return NextResponse.json(
                { error: "Invalid granularity. Use: daily, weekly, monthly, yearly, or all" },
                { status: 400 }
            );
        }

        const data = await getRatingTimeSeries(id, granularity);
        return NextResponse.json(data);
    } catch (err) {
        console.error("/api/ratings/[id]/timeseries GET error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}