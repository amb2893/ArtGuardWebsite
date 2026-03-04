import { NextRequest, NextResponse } from "next/server";
import { getRatingReviewsByWebsite, addRatingReview } from "../../../../../lib/db";
import { verifyToken } from "../../../../../lib/auth";

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
    console.error("/api/ratings/[id]/reviews GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
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

    const bodyJson = await req.json();
    const body = typeof bodyJson === "object" ? (bodyJson.body as string) : (bodyJson as string);

    if (!body || typeof body !== "string") {
      return NextResponse.json({ error: "Missing review body" }, { status: 400 });
    }

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const review = await addRatingReview(id, user.id, body);
    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    console.error("/api/ratings/[id]/reviews POST error:", err);
    return NextResponse.json({ error: "Failed to add review" }, { status: 500 });
  }
}
