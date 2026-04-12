import { NextRequest, NextResponse } from "next/server";
import { deleteRatingReview, updateRatingReview } from "../../../../../../lib/db";
import { verifyToken } from "../../../../../../lib/auth";
import { normalizeReviewTags } from "../../../../../../lib/reviewTags";
import { apiErrorResponse } from "../../../../../../lib/apiErrors";

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

    const payload = await req.json();
    const body = typeof payload?.body === "string" ? payload.body.trim() : "";
    if (!body) {
      return NextResponse.json({ error: "Missing review body" }, { status: 400 });
    }

    const tags = normalizeReviewTags(payload?.tags);

    const updated = await updateRatingReview(reviewId, websiteId, user.id, body, tags);
    if (!updated) {
      return NextResponse.json({ error: "Review not found or not owned by user" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    return apiErrorResponse("/api/ratings/[id]/reviews/[reviewId] PATCH", err, "Failed to update review");
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

    const deleted = await deleteRatingReview(reviewId, websiteId, user.id);
    if (!deleted) {
      return NextResponse.json({ error: "Review not found or not owned by user" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse("/api/ratings/[id]/reviews/[reviewId] DELETE", err, "Failed to delete review");
  }
}
