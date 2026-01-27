import { getWebsites } from "@/lib/db";
import SearchRatings from "./components/SearchRatings";
import { Website } from "@/lib/types";

export default async function RatingsPage() {
    const websites: Website[] = await getWebsites();

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Website Ratings</h1>
            <p className="mb-4">Browse and rate websites for AI art usage.</p>

            <SearchRatings websites={websites} />
        </div>
    );
}
