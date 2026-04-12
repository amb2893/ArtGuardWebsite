import { NextRequest, NextResponse } from "next/server";
import { getRatingReviewsByWebsite, addRatingReview } from "../../../../../lib/db";
import { verifyToken } from "../../../../../lib/auth";
import { normalizeReviewTags } from "../../../../../lib/reviewTags";
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

    const reviews = await getRatingReviewsByWebsite(id);
    return NextResponse.json(reviews);
  } catch (err) {
    return apiErrorResponse("/api/ratings/[id]/reviews GET", err, "Failed to load reviews");
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const bodyJson: unknown = await req.json();
    const objectBody = bodyJson && typeof bodyJson === "object" ? (bodyJson as { body?: unknown; tags?: unknown }) : null;
    const body = typeof objectBody?.body === "string" ? objectBody.body : typeof bodyJson === "string" ? bodyJson : "";
    const tags = normalizeReviewTags(objectBody?.tags);

    if (!body || typeof body !== "string") {
      return NextResponse.json({ error: "Missing review body" }, { status: 400 });
    }

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const review = await addRatingReview(id, user.id, body, tags);
    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    return apiErrorResponse("/api/ratings/[id]/reviews POST", err, "Failed to add review");
  }
}
