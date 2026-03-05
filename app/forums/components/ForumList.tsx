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
        <div className="forums-table" role="table" aria-label="Forum topics">
            <div className="forums-table-head" role="rowgroup">
                <div role="row">
                    <div role="columnheader">Topic</div>
                    <div role="columnheader">Author</div>
                    <div role="columnheader">Last Activity</div>
                </div>
            </div>
            <div className="forums-table-body" role="rowgroup">
                {posts.map((p, index) => (
                    <Link
                        key={p.id}
                        href={`/forums/${p.id}`}
                        className="forums-row"
                        role="row"
                        style={{ animationDelay: `${index * 40}ms` }}
                        aria-label={`Open topic ${p.title} by ${p.username}`}
                    >
                        <div className="forums-topic" role="cell">
                            <div className="forums-topic-title">{p.title}</div>
                            <div className="forums-topic-preview">{p.body}</div>
                        </div>
                        <div className="forums-author" role="cell">{p.username}</div>
                        <div className="forums-time" role="cell">{new Date(p.created_at).toLocaleString()}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
}