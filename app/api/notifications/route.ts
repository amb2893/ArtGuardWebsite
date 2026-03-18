import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../lib/auth";
import { pool } from "../../../lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [listRes, countRes] = await Promise.all([
    pool.query(
      `SELECT id, type, message, article_id, created_at, read_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [user.id]
    ),
    pool.query(
      `SELECT COUNT(*)::int AS unread
       FROM notifications
       WHERE user_id = $1 AND read_at IS NULL`,
      [user.id]
    ),
  ]);

  return NextResponse.json({ notifications: listRes.rows, unread: countRes.rows[0]?.unread ?? 0 });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await pool.query(
    `UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL`,
    [user.id]
  );

  return NextResponse.json({ success: true });
}