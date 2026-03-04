import { getWebsites, getRecentlyRatedWebsites, getTopRatedWebsites } from "@/lib/db";
import SearchRatings from "./components/SearchRatings";
import { Website } from "@/lib/types";
import Link from "next/link";

export default async function RatingsPage() {
    const websites: Website[] = await getWebsites();
    const recentlyRated: Website[] = await getRecentlyRatedWebsites();
    const topRated: Website[] = await getTopRatedWebsites();

    return (
        <div className="ratings-page">
            <div className="ratings-shell">
                <header className="ratings-header">
                    <div>
                        <p className="ratings-eyebrow">Community Ratings</p>
                        <h1 className="ratings-title">Website Ratings</h1>
                        <p className="ratings-subtitle">Browse and rate websites for AI art usage.</p>
                    </div>
                </header>

                <div className="ratings-main-content">
                    <SearchRatings websites={websites} recentlyRated={recentlyRated} topRated={topRated} />
                </div>
            </div>
        </div>
    );
}
