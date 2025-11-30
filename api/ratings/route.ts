import { NextRequest, NextResponse } from "next/server";
import { pool } from "../../lib/db";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("q") || "";

        const result = await pool.query(
            `SELECT website_name, report_count 
       FROM websites 
       WHERE website_name ILIKE $1
       ORDER BY report_count DESC`,
            [`%${search}%`]
        );

        return NextResponse.json(result.rows);
    } catch (err) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
