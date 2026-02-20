import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../lib/auth";
import { createDraftArticle, isAdmin } from "../../../../lib/db";

export const runtime = "nodejs";

const allowed = new Set(["Beginner", "Intermediate", "Advanced"]);

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!(await isAdmin(user.id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { title, body, blurb, difficulty } = await req.json();

    if (!title || !body) return NextResponse.json({ error: "Missing title/body" }, { status: 400 });
    if (!blurb) return NextResponse.json({ error: "Missing blurb" }, { status: 400 });

    const diff = String(difficulty || "Beginner");
    if (!allowed.has(diff)) {
      return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });
    }

    const draft = await createDraftArticle(
      user.id,
      String(title).trim(),
      String(body).trim(),
      String(blurb).trim(),
      diff as any
    );

    return NextResponse.json(draft, { status: 201 });
  } catch (err: any) {
    console.error("/api/admin/articles POST error:", err);
    return NextResponse.json({ error: "Server error", detail: err?.message ?? String(err) }, { status: 500 });
  }
}