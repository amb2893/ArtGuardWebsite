import { getWebsites, incrementReport } from "@/lib/db";
import SearchRatings from "./components/SearchRatings";
import { Website } from "@/lib/types";

export default async function RatingsPage() {
    const websites: Website[] = await getWebsites();

    async function handleReport(id: number) {
        "use server";
        await incrementReport(id);
        // Optionally trigger a revalidation or client refresh if you want live updates
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Website Ratings</h1>

            <SearchRatings websites={websites} onReport={handleReport} />
        </div>
    );
}
