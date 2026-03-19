"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface PopularWebsite {
    id: number;
    website_name: string;
    rating_count: number;
    review_count: number;
    total_activity: number;
}

export default function PopularWebsites() {
    const [websites, setWebsites] = useState<PopularWebsite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/popular-websites?limit=5")
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch popular websites");
                return res.json();
            })
            .then(data => {
                setWebsites(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError("Failed to load popular websites");
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="popular-section">
                <h2 className="popular-heading">⭐ MOST REVIEWED WEBSITES</h2>
                <div className="popular-loading">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="popular-section">
                <h2 className="popular-heading">⭐ MOST REVIEWED WEBSITES</h2>
                <div className="popular-error">{error}</div>
            </div>
        );
    }

    if (websites.length === 0) {
        return (
            <div className="popular-section">
                <h2 className="popular-heading">⭐ MOST REVIEWED WEBSITES</h2>
                <div className="popular-empty">No websites rated yet. Be the first to rate one!</div>
            </div>
        );
    }

    return (
        <section className="popular-section">
            <h2 className="popular-heading"><span aria-label="Rating">⭐</span> MOST REVIEWED WEBSITES</h2>
            <div className="popular-list">
                {websites.map(website => (
                    <Link href={`/ratings/${website.id}`} key={website.id} className="popular-item">
                        <div className="popular-item-header">
                            <h3 className="popular-item-title">{website.website_name}</h3>
                            <span className="popular-item-badge-group">
                                <span className="popular-item-badge rating">
                                    👍 {website.rating_count}
                                </span>
                                {website.review_count > 0 && (
                                    <span className="popular-item-badge review">
                                        💬 {website.review_count}
                                    </span>
                                )}
                            </span>
                        </div>
                        <p className="popular-item-meta">
                            Total Activity: {website.total_activity} interactions
                        </p>
                    </Link>
                ))}
            </div>
            <Link href="/ratings" className="popular-view-all">
                View All Ratings →
            </Link>
        </section>
    );
}
