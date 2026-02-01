import { getWebsite, getWebsiteRatings, getUserRating } from "@/lib/db";
import WebsitePageClient from "@/app/ratings/components/WebsitePageClient";
import { Website } from "@/lib/types";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export default async function WebsitePage({
    params,
}: {
    params: Promise<{ id: string }> | { id: string };
}) {
    const { id } = (await params) as { id: string };
    const websiteId = Number(id);
    if (Number.isNaN(websiteId)) return <div>Invalid website id</div>;

    try {
        const website: Website | undefined = await getWebsite(websiteId);
        if (!website) return <div>Website not found</div>;

        const ratingsData = await getWebsiteRatings(websiteId);
        
        // Get current user's rating if logged in
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        let userRating = null;
        
        if (token) {
            try {
                const user = verifyToken(token);
                if (user) {
                    userRating = await getUserRating(websiteId, user.id);
                }
            } catch (err) {
                // User not logged in or invalid token
                console.log("No valid user session");
            }
        }

        return (
            <div className="p-4">
                <WebsitePageClient 
                    website={website} 
                    ratingsData={ratingsData}
                    userRating={userRating?.rating || null}
                />
            </div>
        );
    } catch (error) {
        console.error("Failed to load website:", error);
        return <div>Failed to load website. Please try again later.</div>;
    }
}
