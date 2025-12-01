// app/ratings/components/SearchRatings.tsx
"use client";

import React, { useState } from "react";

export default function SearchRatings({ websites }: { websites: { id: number; website_name: string; report_count: number; }[] }) {
    const [query, setQuery] = useState("");

    const filtered = websites.filter((w) => w.website_name.toLowerCase().includes(query.toLowerCase()));

    return (
        <div>
            <input
                type="text"
                placeholder="Search websites..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ marginBottom: "10px" }}
            />
            <ul>
                {filtered.map((site) => (
                    <li key={site.id}>
                        <strong>{site.website_name}</strong>: {site.report_count} reports
                    </li>
                ))}
            </ul>
        </div>
    );
}
