// app/ratings/page.tsx
import React from "react";
import { getWebsites } from "../../lib/db";
import SearchRatings from "./components/SearchRatings";

export default async function RatingsPage() {
    const websites = await getWebsites();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Website Ratings</h1>

            {/* Add the search component here */}
            <SearchRatings websites={websites} />

            {/* Optional: you can also display a table or list of all websites */}
            <ul className="mt-4">
                {websites.map((site) => (
                    <li key={site.id}>
                        {site.website_name} - Reports: {site.report_count}
                    </li>
                ))}
            </ul>
        </div>
    );
}
