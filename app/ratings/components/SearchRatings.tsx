// app/ratings/components/SearchRatings.tsx
"use client";

import React, { useState } from "react";
import { Website } from "@/lib/types";
import WebsiteList from "./WebsiteList";

interface SearchRatingsProps {
    websites: Website[];
}

export default function SearchRatings({ websites }: SearchRatingsProps) {
    const [query, setQuery] = useState("");

    const filtered = websites.filter((w) =>
        w.website_name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div>
            <input
                type="text"
                placeholder="Search websites..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="p-2 w-full border rounded mb-4"
            />
            <WebsiteList websites={filtered} />
        </div>
    );
}
