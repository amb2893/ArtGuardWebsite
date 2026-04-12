import { NextRequest, NextResponse } from "next/server";
import { getArticleCommentsByArticle, addArticleComment } from "../../../../../lib/db";
import { verifyToken } from "../../../../../lib/auth";
import { apiErrorResponse } from "../../../../../lib/apiErrors";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const comments = await getArticleCommentsByArticle(id);
    return NextResponse.json(comments);
  } catch (err) {
    return apiErrorResponse("/api/articles/[id]/comments GET", err, "Failed to load comments");
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params; // ✅ unwrap promise params
    const id = Number(idParam);
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const bodyJson = await req.json();
    const body = typeof bodyJson === "object" ? (bodyJson.body as string) : (bodyJson as string);

    if (!body || typeof body !== "string") {
      return NextResponse.json({ error: "Missing comment body" }, { status: 400 });
    }

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const comment = await addArticleComment(id, user.id, body);
    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    return apiErrorResponse("/api/articles/[id]/comments POST", err, "Failed to add comment");
  }
}