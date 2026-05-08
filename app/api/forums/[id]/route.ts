import { NextRequest, NextResponse } from "next/server";
import { updateForumPost, deleteForumPost, adminDeleteContent, isAdmin } from "../../../../lib/db";
import { verifyToken } from "../../../../lib/auth";
import { apiErrorResponse } from "../../../../lib/apiErrors";

export const runtime = "nodejs";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const postId = Number(idParam);
    if (Number.isNaN(postId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const bodyJson = await req.json();
    const title = typeof bodyJson?.title === "string" ? bodyJson.title.trim() : "";
    const body = typeof bodyJson?.body === "string" ? bodyJson.body.trim() : "";
    if (!title || !body) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
    }

    const updated = await updateForumPost(postId, user.id, title, body);
    if (!updated) return NextResponse.json({ error: "Post not found or forbidden" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (err) {
    return apiErrorResponse("/api/forums/[id] PUT", err, "Failed to update post");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const postId = Number(idParam);
    if (Number.isNaN(postId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userIsAdmin = await isAdmin(user.id);
    if (userIsAdmin) {
      await adminDeleteContent("forum_post", postId);
      return NextResponse.json({ ok: true });
    }

    const deleted = await deleteForumPost(postId, user.id);
    if (!deleted) return NextResponse.json({ error: "Post not found or forbidden" }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse("/api/forums/[id] DELETE", err, "Failed to delete post");
  }
}
