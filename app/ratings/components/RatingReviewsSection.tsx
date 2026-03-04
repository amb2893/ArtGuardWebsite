"use client";

import React, { useEffect, useState } from "react";
import { RatingReview } from "../../../lib/types";
import RatingReviewsList from "./RatingReviewsList";
import NewRatingReviewForm from "./NewRatingReviewForm";

interface Props {
    websiteId: number;
}

export default function RatingReviewsSection({ websiteId }: Props) {
    const [reviews, setReviews] = useState<RatingReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/ratings/${websiteId}/reviews`, { credentials: "same-origin" });
                if (!res.ok) {
                    setError("Failed to load reviews.");
                    return;
                }
                const data: RatingReview[] = await res.json();
                if (!cancelled) setReviews(data);
            } catch (err) {
                if (!cancelled) setError("Network error.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [websiteId]);

    function handleNewReview(r: RatingReview) {
        setReviews((prev) => [...prev, r]);
    }

    return (
        <div className="rating-reviews">
            <div className="rating-reviews-header">
                <h3 className="website-card-title">
                    Leave a Review <em>(optional)</em>
                </h3>
            </div>
            <NewRatingReviewForm websiteId={websiteId} onCreated={handleNewReview} />
            <div className="rating-reviews-body">
                {loading && <div className="rating-reviews-muted">Loading reviews...</div>}
                {error && <div className="rating-reviews-error">{error}</div>}
                {!loading && !error && <RatingReviewsList reviews={reviews} />}
            </div>
        </div>
    );
}
