import { NextRequest, NextResponse } from "next/server";
import { getForumPosts, createForumPost } from "../../lib/db";
import { verifyToken } from "../../lib/auth";

export async function GET() {
    const posts = await getForumPosts();
    return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
    const { title, body } = await req.json();
    const token = req.cookies.get("token")?.value;

    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const post = await createForumPost(user.id, title, body);
    return NextResponse.json(post);
}
