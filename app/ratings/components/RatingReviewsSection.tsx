"use client";

import { useEffect, useState } from "react";
import { RatingReview } from "../../../lib/types";
import RatingReviewsList from "./RatingReviewsList";
import NewRatingReviewForm from "./NewRatingReviewForm";

interface Props {
    websiteId: number;
    currentUserId: number | null;
}

export default function RatingReviewsSection({ websiteId, currentUserId }: Props) {
    const [reviews, setReviews] = useState<RatingReview[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/ratings/${websiteId}/reviews`, { credentials: "same-origin" });
                if (!res.ok) { setError("Failed to load reviews."); return; }
                const data: RatingReview[] = await res.json();
                if (!cancelled) setReviews(data);
            } catch {
                if (!cancelled) setError("Network error.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [websiteId]);

    useEffect(() => {
        let cancelled = false;

        async function loadMe() {
            try {
                const res = await fetch("/api/me", { cache: "no-store", credentials: "same-origin" });
                if (!res.ok) return;
                const data = await res.json();
                if (!cancelled) setIsAdmin(Boolean(data?.isAdmin));
            } catch { /* not logged in */ }
        }

        loadMe();
        return () => { cancelled = true; };
    }, []);

    function handleNewReview(r: RatingReview) {
        setReviews((prev) => [...prev, r]);
    }

    async function handleUpdateReview(reviewId: number, body: string, tags: string[]) {
        const res = await fetch(`/api/ratings/${websiteId}/reviews/${reviewId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ body, tags }),
        });
        if (!res.ok) throw new Error("Failed to update review");
        const updated: RatingReview = await res.json();
        setReviews((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));
    }

    async function handleDeleteReview(reviewId: number) {
        const res = await fetch(`/api/ratings/${websiteId}/reviews/${reviewId}`, {
            method: "DELETE",
            credentials: "same-origin",
        });
        if (!res.ok) throw new Error("Failed to delete review");
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    }

    return (
        <div className="rating-reviews">
            <div className="rating-reviews-header">
                <h3 className="website-card-title">
                    Leave a Review <em>(optional)</em>
                </h3>
            </div>
            <NewRatingReviewForm websiteId={websiteId} onCreated={handleNewReview} canSubmit={currentUserId !== null} />
            <div className="rating-reviews-body">
                {loading && <div className="rating-reviews-muted">Loading reviews...</div>}
                {error && <div className="rating-reviews-error">{error}</div>}
                {!loading && !error && (
                    <RatingReviewsList
                        reviews={reviews}
                        currentUserId={currentUserId}
                        isAdmin={isAdmin}
                        onUpdate={handleUpdateReview}
                        onDelete={handleDeleteReview}
                    />
                )}
            </div>
        </div>
    );
}
