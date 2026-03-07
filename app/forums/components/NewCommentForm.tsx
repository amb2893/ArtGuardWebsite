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
    const errorId = error ? "forum-comment-error" : undefined;

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
        <form onSubmit={handleSubmit} className="forum-comment-form">
            {error && <div className="forum-comment-error" id="forum-comment-error" role="alert" aria-live="assertive">{error}</div>}
            <label htmlFor="forum-comment-body" className="sr-only">Write a comment</label>
            <textarea
                id="forum-comment-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a comment..."
                title="Enter your comment on this forum topic"
                rows={4}
                className="forum-comment-textarea"
                required
                aria-invalid={Boolean(error)}
                aria-describedby={errorId}
            />
            <button type="submit" className="forum-comment-submit" disabled={loading}>
                {loading ? "Posting..." : "Post Comment"}
            </button>
        </form>
    );
}