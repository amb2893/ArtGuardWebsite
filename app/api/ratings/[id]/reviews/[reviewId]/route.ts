import { NextRequest, NextResponse } from "next/server";
import { deleteRatingReviewByAuthor, updateRatingReviewByAuthor } from "../../../../../../lib/db";
import { verifyToken } from "../../../../../../lib/auth";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  try {
    const { id: idParam, reviewId: reviewIdParam } = await params;
    const websiteId = Number(idParam);
    const reviewId = Number(reviewIdParam);

    if (Number.isNaN(websiteId) || Number.isNaN(reviewId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const bodyJson = await req.json();
    const body = typeof bodyJson === "object" ? (bodyJson.body as string) : "";

    if (!body || !body.trim()) {
      return NextResponse.json({ error: "Review body is required" }, { status: 400 });
    }

    const updated = await updateRatingReviewByAuthor(reviewId, websiteId, user.id, body.trim());
    if (!updated) {
      return NextResponse.json({ error: "Review not found or forbidden" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("/api/ratings/[id]/reviews/[reviewId] PATCH error:", err);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  try {
    const { id: idParam, reviewId: reviewIdParam } = await params;
    const websiteId = Number(idParam);
    const reviewId = Number(reviewIdParam);

    if (Number.isNaN(websiteId) || Number.isNaN(reviewId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const deleted = await deleteRatingReviewByAuthor(reviewId, websiteId, user.id);
    if (!deleted) {
      return NextResponse.json({ error: "Review not found or forbidden" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("/api/ratings/[id]/reviews/[reviewId] DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
