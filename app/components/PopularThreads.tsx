"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface PopularThread {
    id: number;
    title: string;
    body: string;
    author_id: number;
    username: string;
    created_at: string;
    comment_count: number;
}

export default function PopularThreads() {
    const [threads, setThreads] = useState<PopularThread[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/popular-threads?limit=5")
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch popular threads");
                return res.json();
            })
            .then(data => {
                setThreads(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError("Failed to load popular threads");
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="popular-section">
                <h2 className="popular-heading">🔥 TRENDING DISCUSSIONS</h2>
                <div className="popular-loading">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="popular-section">
                <h2 className="popular-heading">🔥 TRENDING DISCUSSIONS</h2>
                <div className="popular-error">{error}</div>
            </div>
        );
    }

    if (threads.length === 0) {
        return (
            <div className="popular-section">
                <h2 className="popular-heading">🔥 TRENDING DISCUSSIONS</h2>
                <div className="popular-empty">No discussions yet. Be the first to start one!</div>
            </div>
        );
    }

    return (
        <section className="popular-section">
            <h2 className="popular-heading"><span aria-label="Trending">🔥</span> TRENDING DISCUSSIONS</h2>
            <div className="popular-list">
                {threads.map(thread => (
                    <Link href={`/forums/${thread.id}`} key={thread.id} className="popular-item">
                        <div className="popular-item-header">
                            <h3 className="popular-item-title">{thread.title}</h3>
                            <span className="popular-item-badge">
                                💬 {thread.comment_count}
                            </span>
                        </div>
                        <p className="popular-item-meta">
                            by <span className="popular-item-author">{thread.username}</span>
                        </p>
                        <p className="popular-item-excerpt">
                            {thread.body.length > 120 
                                ? thread.body.substring(0, 120) + "..." 
                                : thread.body}
                        </p>
                    </Link>
                ))}
            </div>
            <Link href="/forums" className="popular-view-all">
                View All Discussions →
            </Link>
        </section>
    );
}
