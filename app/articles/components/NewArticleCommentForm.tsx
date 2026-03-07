"use client";

import React, { useState } from "react";
import { ArticleComment } from "../../../lib/types";

interface Props {
    articleId: number;
    onCreated: (c: ArticleComment) => void;
}

export default function NewArticleCommentForm({ articleId, onCreated }: Props) {
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const errorId = error ? "article-comment-error" : undefined;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!body.trim()) {
            setError("Comment cannot be empty");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/articles/${articleId}/comments`, {
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

            const created: ArticleComment = await res.json();
            onCreated(created);
            setBody("");
        } catch (err) {
            setError("Network error.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="article-comment-form">
            {error && <div className="article-comments-error" id="article-comment-error" role="alert" aria-live="assertive">{error}</div>}
            <label htmlFor="article-comment-body" className="sr-only">Write a comment</label>
            <textarea
                id="article-comment-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a comment..."
                title="Enter your comment on this article"
                rows={4}
                className="article-comment-textarea"
                required
                aria-invalid={Boolean(error)}
                aria-describedby={errorId}
            />
            <button type="submit" className="article-comment-submit" disabled={loading}>
                {loading ? "Posting..." : "Post Comment"}
            </button>
        </form>
    );
}
