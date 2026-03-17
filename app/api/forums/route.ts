// app/api/forums/route.ts
import { NextResponse } from "next/server";
import { getForumPosts } from "@/lib/db";

// GET /api/forums
export async function GET() {
  try {
    // Fetch latest forum posts (safe for builds)
    const posts = await getForumPosts();

    // Return as JSON
    return NextResponse.json(posts);
  } catch (err) {
    console.error("Failed to fetch forum posts:", err);

    return NextResponse.json(
      { error: "Failed to fetch forum posts" },
      { status: 500 }
    );
  }
}