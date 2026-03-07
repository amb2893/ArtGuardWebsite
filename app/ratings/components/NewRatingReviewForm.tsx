"use client";

import React, { useState } from "react";
import { RatingReview } from "../../../lib/types";

interface Props {
    websiteId: number;
    onCreated: (r: RatingReview) => void;
}

export default function NewRatingReviewForm({ websiteId, onCreated }: Props) {
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const errorId = error ? "rating-review-error" : undefined;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!body.trim()) {
            setError("Review cannot be empty");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/ratings/${websiteId}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ body: body.trim() }),
            });

            if (res.status === 401) {
                setError("You must be logged in to write a review.");
                return;
            }

            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                setError(json?.error || "Failed to create review.");
                return;
            }

            const created: RatingReview = await res.json();
            onCreated(created);
            setBody("");
        } catch (err) {
            setError("Network error.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="rating-review-form">
            {error && <div className="rating-review-error" id="rating-review-error" role="alert" aria-live="assertive">{error}</div>}
            <label htmlFor="rating-review-body" className="sr-only">Write a review</label>
            <textarea
                id="rating-review-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a review about this website..."
                title="Enter your review of this website's treatment of artists"
                rows={4}
                className="rating-review-textarea"
                required
                aria-invalid={Boolean(error)}
                aria-describedby={errorId}
            />
            <button type="submit" className="rating-review-submit" disabled={loading}>
                {loading ? "Posting..." : "Post Review"}
            </button>
        </form>
    );
}
