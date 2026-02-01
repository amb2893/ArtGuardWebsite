"use client";

import { useState } from "react";
import { Website } from "../../../lib/types";
import { useRouter } from "next/navigation";

interface Props {
    website: Website;
    ratingsData: {
        positive_count: string;
        negative_count: string;
        total_ratings: string;
    };
    userRating: number | null; // 1 for positive, -1 for negative, null for no rating
}

export default function WebsitePageClient({ website, ratingsData, userRating: initialUserRating }: Props) {
    const router = useRouter();
    const [isRating, setIsRating] = useState(false);
    const [userRating, setUserRating] = useState<number | null>(initialUserRating);
    const [positiveCount, setPositiveCount] = useState(Number(ratingsData.positive_count));
    const [negativeCount, setNegativeCount] = useState(Number(ratingsData.negative_count));

    async function handleRate(rating: number) {
        setIsRating(true);
        try {
            const response = await fetch(`/app/api/ratings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    websiteId: website.id, 
                    rating 
                }),
            });

            if (response.status === 401) {
                alert("Please log in to rate websites");
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to submit rating");
            }

            // Update local state optimistically
            const previousRating = userRating;
            
            // If user had a previous rating, remove it from the count
            if (previousRating === 1) {
                setPositiveCount(prev => prev - 1);
            } else if (previousRating === -1) {
                setNegativeCount(prev => prev - 1);
            }
            
            // Add new rating to the count
            if (rating === 1) {
                setPositiveCount(prev => prev + 1);
            } else {
                setNegativeCount(prev => prev + 1);
            }
            
            setUserRating(rating);
            
            // Refresh the page data from server
            router.refresh();
        } catch (error) {
            console.error("Error submitting rating:", error);
            alert("Failed to submit rating. Please try again.");
        } finally {
            setIsRating(false);
        }
    }

    const totalRatings = positiveCount + negativeCount;
    const positivePercentage = totalRatings > 0 
        ? Math.round((positiveCount / totalRatings) * 100)
        : 0;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{website.website_name}</h1>
                <div className="text-gray-600">
                    Report Count: {website.report_count}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Community Ratings</h2>
                
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Positive ({positiveCount})</span>
                        <span className="text-sm text-gray-600">{positivePercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${positivePercentage}%` }}
                        ></div>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Negative ({negativeCount})</span>
                        <span className="text-sm text-gray-600">{100 - positivePercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-red-600 h-2.5 rounded-full" 
                            style={{ width: `${100 - positivePercentage}%` }}
                        ></div>
                    </div>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                    Total Ratings: {totalRatings}
                </div>

                <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Rate this website</h3>
                    {userRating !== null && (
                        <div className="text-sm text-gray-600 mb-2">
                            Your current rating: {userRating === 1 ? "👍 Positive" : "👎 Negative"}
                        </div>
                    )}
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleRate(1)}
                            disabled={isRating}
                            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                                userRating === 1
                                    ? "bg-green-600 text-white"
                                    : "bg-green-100 text-green-700 hover:bg-green-200"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            👍 Positive
                        </button>
                        <button
                            onClick={() => handleRate(-1)}
                            disabled={isRating}
                            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                                userRating === -1
                                    ? "bg-red-600 text-white"
                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            👎 Negative
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {userRating !== null 
                            ? "Click to change your rating" 
                            : "Rate based on this website's use of AI-generated art"}
                    </p>
                </div>
            </div>

            <div className="mt-4">
                <button
                    onClick={() => router.push("/ratings")}
                    className="text-blue-600 hover:underline"
                >
                    ← Back to all websites
                </button>
            </div>
        </div>
    );
}
