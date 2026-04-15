import { NextRequest, NextResponse } from "next/server";
import { deleteCommentByAuthor, updateCommentByAuthor } from "../../../../../../lib/db";
import { verifyToken } from "../../../../../../lib/auth";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id: idParam, commentId: commentIdParam } = await params;
    const postId = Number(idParam);
    const commentId = Number(commentIdParam);

    if (Number.isNaN(postId) || Number.isNaN(commentId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const bodyJson = await req.json();
    const body = typeof bodyJson === "object" ? (bodyJson.body as string) : "";

    if (!body || !body.trim()) {
      return NextResponse.json({ error: "Comment body is required" }, { status: 400 });
    }

    const updated = await updateCommentByAuthor(commentId, postId, user.id, body.trim());
    if (!updated) {
      return NextResponse.json({ error: "Comment not found or forbidden" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("/api/forums/[id]/comments/[commentId] PATCH error:", err);
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id: idParam, commentId: commentIdParam } = await params;
    const postId = Number(idParam);
    const commentId = Number(commentIdParam);

    if (Number.isNaN(postId) || Number.isNaN(commentId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const deleted = await deleteCommentByAuthor(commentId, postId, user.id);
    if (!deleted) {
      return NextResponse.json({ error: "Comment not found or forbidden" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("/api/forums/[id]/comments/[commentId] DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
