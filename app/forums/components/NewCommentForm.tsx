"use client";

import React, { useState } from "react";
import { Comment } from "../../../lib/types";

interface Props {
    postId: number;
    onCreated: (c: Comment) => void;
}

export default function NewCommentForm({ postId, onCreated }: Props) {
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!body.trim()) {
            setError("Comment cannot be empty");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/forums/${postId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ body: body.trim() }),
            });

            if (res.status === 401) {
                setError("You must be logged in to comment.");
                return;
            }

            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                setError(json?.error || "Failed to create comment.");
                return;
            }

            const created: Comment = await res.json();
            onCreated(created);
            setBody("");
        } catch (err) {
            setError("Network error.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl">
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a comment..."
                rows={4}
                className="w-full p-2 border rounded mb-2"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
                {loading ? "Posting..." : "Post Comment"}
            </button>
        </form>
    );
}