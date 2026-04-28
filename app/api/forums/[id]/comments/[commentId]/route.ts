import { NextRequest, NextResponse } from "next/server";
import { deleteComment, updateComment } from "../../../../../../lib/db";
import { verifyToken } from "../../../../../../lib/auth";
import { apiErrorResponse } from "../../../../../../lib/apiErrors";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id: idParam, commentId: commentIdParam } = await params;
    const id = Number(idParam);
    const commentId = Number(commentIdParam);

    if (Number.isNaN(id) || Number.isNaN(commentId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const bodyJson = await req.json();
    const body = typeof bodyJson?.body === "string" ? bodyJson.body.trim() : "";
    if (!body) {
      return NextResponse.json({ error: "Missing comment body" }, { status: 400 });
    }

    const updated = await updateComment(id, commentId, user.id, body);
    if (!updated) {
      return NextResponse.json({ error: "Comment not found or forbidden" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    return apiErrorResponse(
      "/api/forums/[id]/comments/[commentId] PUT",
      err,
      "Failed to update comment"
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id: idParam, commentId: commentIdParam } = await params;
    const id = Number(idParam);
    const commentId = Number(commentIdParam);

    if (Number.isNaN(id) || Number.isNaN(commentId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const deleted = await deleteComment(id, commentId, user.id);
    if (!deleted) {
      return NextResponse.json({ error: "Comment not found or forbidden" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(
      "/api/forums/[id]/comments/[commentId] DELETE",
      err,
      "Failed to delete comment"
    );
  }
}
