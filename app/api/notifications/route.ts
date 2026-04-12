import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../lib/auth";
import { pool } from "../../../lib/db";
import { apiErrorResponse } from "../../../lib/apiErrors";

export const runtime = "nodejs";

let notificationsTableReady = false;

async function ensureNotificationsTable() {
  if (notificationsTableReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      article_id INTEGER NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      read_at TIMESTAMP NULL
    )
  `);

  await pool.query(
    "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS article_id INTEGER NULL"
  );
  await pool.query(
    "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP NULL"
  );
  await pool.query(
    "CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id, created_at DESC)"
  );

  notificationsTableReady = true;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await ensureNotificationsTable();

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
  } catch (err) {
    return apiErrorResponse("/api/notifications GET", err, "Failed to load notifications");
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await ensureNotificationsTable();

    const body = await req.json().catch(() => null);
    const id = body?.id ? Number(body.id) : null;

    if (id && !Number.isNaN(id)) {
      // mark single notification as read (only if belongs to user)
      await pool.query(
        `UPDATE notifications SET read_at = NOW() WHERE id = $1 AND user_id = $2`,
        [id, user.id]
      );
      return NextResponse.json({ success: true });
    }

    // otherwise mark all as read
    await pool.query(
      `UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL`,
      [user.id]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiErrorResponse("/api/notifications POST", err, "Failed to update notifications");
  }
}