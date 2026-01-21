"use client";

import React from "react";
import { Comment } from "../../../lib/types";

interface Props {
    comments: Comment[];
}

export default function CommentsList({ comments }: Props) {
    if (!comments || comments.length === 0) return <div>No comments yet.</div>;

    return (
        <div className="space-y-4">
            {comments.map((c) => (
                <div key={c.id} className="p-3 border rounded">
                    <div className="text-sm text-gray-700 mb-1">
                        <strong>{c.username ?? "Unknown"}</strong> - {new Date(c.created_at).toLocaleString()}
                    </div>
                    <div>{c.body}</div>
                </div>
            ))}
        </div>
    );
}