"use client";

import React from "react";
import { ForumPost } from "../../../lib/types";

interface Props {
    posts: ForumPost[];
}

export default function ForumList({ posts }: Props) {
    if (posts.length === 0) {
        return <div>No forum posts yet.</div>;
    }

    return (
        <div className="space-y-4">
            {posts.map((p) => (
                <div key={p.id} className="p-4 border rounded">
                    <h3 className="text-lg font-semibold">{p.title}</h3>
                    <p className="mt-1">{p.body}</p>
                    <div className="text-sm text-gray-600 mt-2">
                        By {p.username} - {new Date(p.created_at).toLocaleString()}
                    </div>
                </div>
            ))}
        </div>
    );
}