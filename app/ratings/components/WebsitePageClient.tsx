"use client";

import { useState } from "react";
import { Website } from "../../../lib/types";
import { useRouter } from "next/navigation";
import RatingReviewsSection from "./RatingReviewsSection";
import RatingsChart from "./RatingsChart";


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
    const [ratingError, setRatingError] = useState<string | null>(null);
    const [ratingStatus, setRatingStatus] = useState<string | null>(null);

    async function handleRate(rating: number) {
        setIsRating(true);
        setRatingError(null);
        setRatingStatus(null);
        try {
            const response = await fetch(`/api/ratings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    websiteId: website.id, 
                    rating 
                }),
            });

            if (response.status === 401) {
                setRatingError("Please log in to rate websites.");
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
            setRatingStatus("Your rating has been submitted.");
            
            // Refresh the page data from server
            router.refresh();
        } catch (error) {
            console.error("Error submitting rating:", error);
            setRatingError("Failed to submit rating. Please try again.");
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
            <div className="website-detail-hero">
                <div className="website-detail-hero-content">
                    <h1 className="website-detail-title">{website.website_name}</h1>
                    <div className="website-detail-count">
                        {website.report_count} {website.report_count === 1 ? 'rating' : 'ratings'}
                    </div>
                </div>
            </div>

            <div className="website-detail-main">
                <div className="website-detail-container">
                    <div className="website-ratings-card">
                        <h2 className="website-card-title">Community Ratings</h2>
                        
                        <div className="ratings-bars-container">
                            <div className="rating-bar-item">
                                <div className="rating-bar-header">
                                    <span className="rating-label">👍 Positive</span>
                                    <div className="rating-stats">
                                        <span className="rating-count">{positiveCount}</span>
                                        <span className="rating-percentage">{positivePercentage}%</span>
                                    </div>
                                </div>
                                <div className="rating-bar-track">
                                    <div 
                                        className="rating-bar-fill rating-bar-positive" 
                                        style={{ width: `${positivePercentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="rating-bar-item">
                                <div className="rating-bar-header">
                                    <span className="rating-label">👎 Negative</span>
                                    <div className="rating-stats">
                                        <span className="rating-count">{negativeCount}</span>
                                        <span className="rating-percentage">{100 - positivePercentage}%</span>
                                    </div>
                                </div>
                                <div className="rating-bar-track">
                                    <div 
                                        className="rating-bar-fill rating-bar-negative" 
                                        style={{ width: `${100 - positivePercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="total-ratings-display">
                            Total Ratings: <strong>{totalRatings}</strong>
                        </div>
                    </div>

                    <div className="website-rate-card">
                        <h3 className="website-card-title">Rate This Website</h3>
                        {userRating !== null && (
                            <div className="current-rating-badge">
                                Your rating: {userRating === 1 ? "👍 Positive" : "👎 Negative"}
                            </div>
                        )}
                        <RatingsChart websiteId={website.id} />
                        <div className="rate-buttons-container">
                            <button
                                onClick={() => handleRate(1)}
                                disabled={isRating}
                                className={`rate-button rate-button-positive ${
                                    userRating === 1 ? "rate-button-active" : ""
                                }`}
                            >
                                <span className="rate-button-icon">👍</span>
                                <span>Positive</span>
                            </button>
                            <button
                                onClick={() => handleRate(-1)}
                                disabled={isRating}
                                className={`rate-button rate-button-negative ${
                                    userRating === -1 ? "rate-button-active" : ""
                                }`}
                            >
                                <span className="rate-button-icon">👎</span>
                                <span>Negative</span>
                            </button>
                        </div>
                        <p className="rate-help-text">
                            {userRating !== null 
                                ? "Click to change your rating" 
                                : "Rate based on this website's use of AI-generated art"}
                        </p>
                        {ratingStatus && (
                            <p className="rate-status" role="status" aria-live="polite">
                                {ratingStatus}
                            </p>
                        )}
                        {ratingError && (
                            <p className="rate-error" role="alert" aria-live="assertive">
                                {ratingError}
                            </p>
                        )}
                    </div>

                    <div className="website-rate-card rating-reviews-container">
                        <RatingReviewsSection websiteId={website.id} />
                    </div>

                    <div className="back-link-container">
                        <button
                            onClick={() => router.push("/ratings")}
                            className="back-link-button"
                        >
                            ← Back to all websites
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
