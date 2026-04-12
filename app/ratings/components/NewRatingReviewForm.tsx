"use client";

import React, { useState } from "react";
import { RatingReview } from "../../../lib/types";
import ReviewTagSelector from "./ReviewTagSelector";

interface Props {
    websiteId: number;
    onCreated: (r: RatingReview) => void;
    canSubmit: boolean;
}

export default function NewRatingReviewForm({ websiteId, onCreated, canSubmit }: Props) {
    const [body, setBody] = useState("");
    const [tags, setTags] = useState<string[]>([]);
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
                body: JSON.stringify({ body: body.trim(), tags }),
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
            setTags([]);
        } catch (err) {
            setError("Network error.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="rating-review-form">
            {!canSubmit && (
                <div className="rating-reviews-muted" role="status" aria-live="polite">
                    Log in to post a review and add policy tags.
                </div>
            )}
            {error && <div className="rating-review-error" id="rating-review-error" role="alert" aria-live="assertive">{error}</div>}
            <label htmlFor="rating-review-body" className="sr-only">Write a review</label>
            <div className="rating-review-input-wrap">
                <textarea
                    id="rating-review-body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write a review about this website..."
                    title="Enter your review of this website's treatment of artists"
                    rows={3}
                    className="rating-review-textarea"
                    required
                    disabled={!canSubmit || loading}
                    aria-invalid={Boolean(error)}
                    aria-describedby={errorId}
                />
                <button type="submit" className="rating-review-submit" disabled={loading || !canSubmit}>
                    {loading ? "Posting..." : "Post Review"}
                </button>
            </div>
            <ReviewTagSelector
                selectedTags={tags}
                onChange={setTags}
                disabled={!canSubmit || loading}
                idPrefix="new-review-tag"
            />
        </form>
    );
}
