import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../../../lib/auth";
import { isAdmin, publishArticle } from "../../../../../../lib/db";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ok = await isAdmin(user.id);
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const published = await publishArticle(id);
    if (!published) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(published);
  } catch (err: any) {
    console.error("[/api/admin/articles/[id]/publish] ERROR:", err);
    return NextResponse.json(
      { error: "Server error", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}