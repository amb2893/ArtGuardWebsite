// app/ratings/components/SearchRatings.tsx
"use client";

import React, { useState } from "react";
import { Website } from "@/lib/types";
import WebsiteList from "./WebsiteList";

interface SearchRatingsProps {
    websites: Website[];
    onReport: (id: number) => void;
}

export default function SearchRatings({ websites, onReport }: SearchRatingsProps) {
    const [query, setQuery] = useState("");

    const filtered = websites.filter((w) =>
        w.website_name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div style={{ marginBottom: "1rem" }}>
            <input
                type="text"
                placeholder="Search websites..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                    padding: "0.5rem",
                    width: "100%",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    marginBottom: "1rem"
                }}
            />
            <WebsiteList websites={filtered} onReport={onReport} />
        </div>
    );
}
