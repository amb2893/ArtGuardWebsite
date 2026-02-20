"use client";

import React from "react";
import { Comment } from "../../../lib/types";

interface Props {
    comments: Comment[];
}

export default function CommentsList({ comments }: Props) {
    if (!comments || comments.length === 0) {
        return <div className="forum-comments-empty">No comments yet.</div>;
    }

    return (
        <div className="forum-comments-stack">
            {comments.map((c) => (
                <div key={c.id} className="forum-comment-card">
                    <div className="forum-comment-meta">
                        <strong>{c.username ?? "Unknown"}</strong> - {new Date(c.created_at).toLocaleString()}
                    </div>
                    <div className="forum-comment-body">{c.body}</div>
                </div>
            ))}
        </div>
    );
}