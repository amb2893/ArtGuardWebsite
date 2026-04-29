import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../lib/auth";
import { createReport } from "../../../lib/db";

export const runtime = "nodejs";

const VALID_TYPES = ["user", "article", "article_comment", "forum_post", "forum_comment", "review"];

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { contentType, contentId, reason } = body;

  if (!VALID_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }
  if (!Number.isInteger(contentId) || contentId < 1) {
    return NextResponse.json({ error: "Invalid content id" }, { status: 400 });
  }
  if (!reason || typeof reason !== "string" || reason.trim().length < 5) {
    return NextResponse.json({ error: "Reason must be at least 5 characters" }, { status: 400 });
  }

  const report = await createReport(user.id, contentType, contentId, reason.trim());
  return NextResponse.json({ success: true, id: report.id }, { status: 201 });
}
