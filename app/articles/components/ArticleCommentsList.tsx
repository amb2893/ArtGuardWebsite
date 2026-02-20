"use client";

import React from "react";
import { ArticleComment } from "../../../lib/types";

interface Props {
    comments: ArticleComment[];
}

export default function ArticleCommentsList({ comments }: Props) {
    if (!comments || comments.length === 0) return <div className="article-comments-muted">No comments yet.</div>;

    return (
        <div className="article-comments-list">
            {comments.map((c) => (
                <div key={c.id} className="article-comment">
                    <div className="article-comment-meta">
                        <strong>{c.username ?? "Unknown"}</strong> - {new Date(c.created_at).toLocaleString()}
                    </div>
                    <div className="article-comment-body">{c.body}</div>
                </div>
            ))}
        </div>
    );
}
