// app/ratings/components/SearchRatings.tsx
"use client";

import React, { useState } from "react";
import { Website } from "@/lib/types";
import WebsiteList from "./WebsiteList";
import Link from "next/link";

interface SearchRatingsProps {
    websites: Website[];
    recentlyRated: Website[];
    topRated: Website[];
}

export default function SearchRatings({ websites, recentlyRated, topRated }: SearchRatingsProps) {
    const [query, setQuery] = useState("");

    const filtered = websites.filter((w) =>
        w.website_name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div>
            <div className="ratings-search-container">
                <label htmlFor="ratings-search" className="sr-only">Search websites by name</label>
                <input
                    id="ratings-search"
                    type="text"
                    placeholder="Search websites..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="ratings-search-input"
                    aria-describedby="ratings-search-help"
                />
                <p id="ratings-search-help" className="sr-only">Type to filter the list of websites.</p>
                <p className="sr-only" role="status" aria-live="polite">
                    {query
                        ? `${filtered.length} ${filtered.length === 1 ? "website" : "websites"} found`
                        : `Showing ${websites.length} websites`}
                </p>
            </div>

            {!query && topRated.length > 0 && (
                <div className="recently-rated-section">
                    <h2 className="recently-rated-title">Top Rated</h2>
                    <div className="recently-rated-grid">
                        {topRated.map((website) => (
                            <Link 
                                key={website.id} 
                                href={`/ratings/${website.id}`}
                                className="recently-rated-link"
                            >
                                <div className="recently-rated-card">
                                    <h3 className="recently-rated-card-title">
                                        {website.website_name}
                                    </h3>
                                    <div className="recently-rated-card-count">
                                        {website.report_count} {website.report_count === 1 ? 'rating' : 'ratings'}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {!query && recentlyRated.length > 0 && (
                <div className="recently-rated-section">
                    <h2 className="recently-rated-title">Recently Rated</h2>
                    <div className="recently-rated-grid">
                        {recentlyRated.map((website) => (
                            <Link 
                                key={website.id} 
                                href={`/ratings/${website.id}`}
                                className="recently-rated-link"
                            >
                                <div className="recently-rated-card">
                                    <h3 className="recently-rated-card-title">
                                        {website.website_name}
                                    </h3>
                                    <div className="recently-rated-card-count">
                                        {website.report_count} {website.report_count === 1 ? 'rating' : 'ratings'}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {query && <WebsiteList websites={filtered} />}
        </div>
    );
}
