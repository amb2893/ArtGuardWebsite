import { getWebsites, getRecentlyRatedWebsites, getTopRatedWebsites } from "@/lib/db";
import SearchRatings from "./components/SearchRatings";
import { Website } from "@/lib/types";
import Link from "next/link";

export default async function RatingsPage() {
    const websites: Website[] = await getWebsites();
    const recentlyRated: Website[] = await getRecentlyRatedWebsites();
    const topRated: Website[] = await getTopRatedWebsites();

    return (
        <div>
            <div className="ratings-hero">
                <div className="ratings-hero-content">
                    <h1 className="ratings-hero-title">Website Ratings</h1>
                    <p className="ratings-hero-desc">Browse and rate websites for AI art usage.</p>
                </div>
            </div>

            <div className="ratings-main-content">
                <SearchRatings websites={websites} recentlyRated={recentlyRated} topRated={topRated} />
            </div>
        </div>
    );
}
