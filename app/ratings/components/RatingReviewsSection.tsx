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
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const [reviewsRes, meRes] = await Promise.all([
                    fetch(`/api/ratings/${websiteId}/reviews`, { credentials: "same-origin" }),
                    fetch("/api/me", { credentials: "same-origin", cache: "no-store" }),
                ]);

                if (!reviewsRes.ok) {
                    setError("Failed to load reviews.");
                    return;
                }

                const data: RatingReview[] = await reviewsRes.json();
                if (!cancelled) setReviews(data);

                if (meRes.ok && !cancelled) {
                    const me = (await meRes.json()) as { id?: number | null };
                    setCurrentUserId(typeof me.id === "number" ? me.id : null);
                }
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

    function handleUpdatedReview(updated: RatingReview) {
        setReviews((prev) => prev.map((review) => (review.id === updated.id ? updated : review)));
    }

    function handleDeletedReview(reviewId: number) {
        setReviews((prev) => prev.filter((review) => review.id !== reviewId));
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
                {!loading && !error && (
                    <RatingReviewsList
                        reviews={reviews}
                        websiteId={websiteId}
                        currentUserId={currentUserId}
                        onUpdated={handleUpdatedReview}
                        onDeleted={handleDeletedReview}
                    />
                )}
            </div>
        </div>
    );
}
