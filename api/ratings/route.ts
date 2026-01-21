import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
    const result = await pool.query("SELECT * FROM websites ORDER BY name ASC");
    return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
    const { id } = await req.json();

    await pool.query(
        "UPDATE websites SET reports = reports + 1 WHERE id = $1",
        [id]
    );

    const updated = await pool.query(
        "SELECT * FROM websites WHERE id = $1",
        [id]
    );

    return NextResponse.json(updated.rows[0]);
}
