"use client";

import Link from "next/link";
import { Website } from "@/lib/types";

interface Props {
    websites: Website[];
}

export default function WebsiteList({ websites }: Props) {
    if (websites.length === 0) {
        return (
            <div className="no-results-message">
                <p>No websites found.</p>
            </div>
        );
    }

    return (
        <div className="search-results-container">
            <h2 className="search-results-title">Search Results</h2>
            <div className="search-results-grid">
                {websites.map((website) => (
                    <Link key={website.id} href={`/ratings/${website.id}`} className="search-result-link">
                        <div className="search-result-card">
                            <h3 className="search-result-card-title">{website.website_name}</h3>
                            <div className="search-result-card-count">
                                {website.report_count} {website.report_count === 1 ? 'rating' : 'ratings'}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

