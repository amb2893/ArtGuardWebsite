import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../../../lib/auth";
import { approvePendingArticle, isAdmin, notifyUser } from "../../../../../../lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(await isAdmin(user.id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updated = await approvePendingArticle(id);
  if (!updated) return NextResponse.json({ error: "Not found or not pending" }, { status: 404 });

  await notifyUser(updated.author_id, "article_approved", `Your article "${updated.title}" was approved and published!`, updated.id);
  return NextResponse.json({ success: true });
}