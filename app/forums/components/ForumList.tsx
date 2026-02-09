"use client";

import Link from "next/link";
import React from "react";
import { ForumPost } from "../../../lib/types";

interface Props {
    posts: ForumPost[];
}

export default function ForumList({ posts }: Props) {
    if (posts.length === 0) {
        return <div className="forums-empty">No forum posts yet.</div>;
    }

    return (
        <div className="forums-table">
            <div className="forums-table-head">
                <div>Topic</div>
                <div>Author</div>
                <div>Last Activity</div>
            </div>
            <div className="forums-table-body">
                {posts.map((p, index) => (
                    <Link
                        key={p.id}
                        href={`/forums/${p.id}`}
                        className="forums-row"
                        style={{ animationDelay: `${index * 40}ms` }}
                    >
                        <div className="forums-topic">
                            <div className="forums-topic-title">{p.title}</div>
                            <div className="forums-topic-preview">{p.body}</div>
                        </div>
                        <div className="forums-author">{p.username}</div>
                        <div className="forums-time">{new Date(p.created_at).toLocaleString()}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
}