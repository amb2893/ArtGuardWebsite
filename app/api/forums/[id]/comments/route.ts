import { NextRequest, NextResponse } from "next/server";
import { getCommentsByPost, addComment } from "../../../../../lib/db";
import { verifyToken } from "../../../../../lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

        const comments = await getCommentsByPost(id);
        return NextResponse.json(comments);
    } catch (err) {
        console.error("/api/forums/[id]/comments GET error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

        const bodyJson = await req.json();
        const body = typeof bodyJson === "object" ? (bodyJson.body as string) : (bodyJson as string);
        if (!body || typeof body !== "string") {
            return NextResponse.json({ error: "Missing comment body" }, { status: 400 });
        }

        const token = req.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = verifyToken(token);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const comment = await addComment(id, user.id, body);
        return NextResponse.json(comment, { status: 201 });
    } catch (err) {
        console.error("/api/forums/[id]/comments POST error:", err);
        return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
    }
}