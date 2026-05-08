import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../../../lib/auth";
import { isAdmin, resolveReport, adminDeleteContent, getReportById } from "../../../../../../lib/db";

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

  const body = await req.json().catch(() => ({}));
  const note = typeof body.note === "string" ? body.note.trim() : "";
  const deleteContent = Boolean(body.deleteContent);

  const report = await getReportById(id);
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  if (deleteContent && report.content_type !== "user") {
    await adminDeleteContent(report.content_type, report.content_id);
  }

  const updated = await resolveReport(id, user.id, note);
  if (!updated) return NextResponse.json({ error: "Report not found or already resolved" }, { status: 404 });

  return NextResponse.json({ success: true });
}
