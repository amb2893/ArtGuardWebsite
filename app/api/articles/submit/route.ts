import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../lib/auth";
import { isAdmin, isTrusted, createPendingArticle, createPublishedArticle } from "../../../../lib/db";

export const runtime = "nodejs";

const allowed = new Set(["Beginner", "Intermediate", "Advanced"]);

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [admin, trusted] = await Promise.all([isAdmin(user.id), isTrusted(user.id)]);
    if (!admin && !trusted) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { title, body, blurb, difficulty } = await req.json();
    if (!title || !body || !blurb) {
      return NextResponse.json({ error: "Missing title/body/blurb" }, { status: 400 });
    }

    const diff = String(difficulty || "Beginner");
    if (!allowed.has(diff)) return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });

    const created = admin
      ? await createPublishedArticle(user.id, String(title).trim(), String(body).trim(), String(blurb).trim(), diff as any)
      : await createPendingArticle(user.id, String(title).trim(), String(body).trim(), String(blurb).trim(), diff as any);

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("/api/articles/submit POST error:", err);
    return NextResponse.json({ error: "Server error", detail: err?.message ?? String(err) }, { status: 500 });
  }
}