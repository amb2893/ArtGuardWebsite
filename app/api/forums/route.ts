import { NextRequest, NextResponse } from "next/server";
import { getForumPosts, createForumPost } from "../../../lib/db";
import { verifyToken } from "../../../lib/auth";

export async function GET() {
    try {
        const posts = await getForumPosts();
        return NextResponse.json(posts);
    } catch (err) {
        console.error("/api/forums GET error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { title, body } = await req.json();

        if (!title || !body) {
            return NextResponse.json({ error: "Missing title or body" }, { status: 400 });
        }

        const token = req.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const user = verifyToken(token);
        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const post = await createForumPost(user.id, title, body);
        return NextResponse.json(post, { status: 201 });
    } catch (err) {
        console.error("/api/forums POST error:", err);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}