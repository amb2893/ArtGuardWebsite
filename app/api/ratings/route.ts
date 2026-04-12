import { NextRequest, NextResponse } from "next/server";
import { createOrUpdateRating } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { apiErrorResponse } from "@/lib/apiErrors";

export async function POST(req: NextRequest) {
    try {
        const { websiteId, rating } = await req.json();

        if (!websiteId || !rating) {
            return NextResponse.json({ error: "Missing websiteId or rating" }, { status: 400 });
        }

        if (rating !== 1 && rating !== -1) {
            return NextResponse.json({ error: "Rating must be 1 or -1" }, { status: 400 });
        }

        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = verifyToken(token);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const ratingRecord = await createOrUpdateRating(websiteId, user.id, rating);
        return NextResponse.json(ratingRecord, { status: 201 });
    } catch (err) {
        return apiErrorResponse("/api/ratings POST", err, "Failed to submit rating");
    }
}
