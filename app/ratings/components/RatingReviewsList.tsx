"use client";

import React, { useState } from "react";
import { RatingReview } from "../../../lib/types";

interface Props {
    reviews: RatingReview[];
    websiteId: number;
    currentUserId: number | null;
    onUpdated: (review: RatingReview) => void;
    onDeleted: (reviewId: number) => void;
}

export default function RatingReviewsList({
    reviews,
    websiteId,
    currentUserId,
    onUpdated,
    onDeleted,
}: Props) {
    const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
    const [draftBody, setDraftBody] = useState("");
    const [loadingReviewId, setLoadingReviewId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (!reviews || reviews.length === 0) return <div className="rating-reviews-muted">No reviews yet.</div>;

    async function saveReview(reviewId: number) {
        const trimmedBody = draftBody.trim();
        if (!trimmedBody) {
            setError("Review cannot be empty.");
            return;
        }

        setError(null);
        setLoadingReviewId(reviewId);
        try {
            const res = await fetch(`/api/ratings/${websiteId}/reviews/${reviewId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ body: trimmedBody }),
            });

            if (!res.ok) {
                const json = (await res.json().catch(() => ({}))) as { error?: string };
                setError(json.error ?? "Failed to update review.");
                return;
            }

            const updated = (await res.json()) as RatingReview;
            onUpdated(updated);
            setEditingReviewId(null);
            setDraftBody("");
        } catch {
            setError("Network error.");
        } finally {
            setLoadingReviewId(null);
        }
    }

    async function deleteReview(reviewId: number) {
        setError(null);
        setLoadingReviewId(reviewId);
        try {
            const res = await fetch(`/api/ratings/${websiteId}/reviews/${reviewId}`, {
                method: "DELETE",
                credentials: "same-origin",
            });

            if (!res.ok) {
                const json = (await res.json().catch(() => ({}))) as { error?: string };
                setError(json.error ?? "Failed to delete review.");
                return;
            }

            onDeleted(reviewId);
            if (editingReviewId === reviewId) {
                setEditingReviewId(null);
                setDraftBody("");
            }
        } catch {
            setError("Network error.");
        } finally {
            setLoadingReviewId(null);
        }
    }

    return (
        <div className="rating-reviews-list">
            {error ? <div className="rating-reviews-error">{error}</div> : null}
            {reviews.map((r) => (
                <div key={r.id} className="rating-review">
                    <div className="rating-review-header">
                        <div className="rating-review-meta">
                            <strong className="rating-review-author">{r.username ?? "Unknown"}</strong>
                            <span className="rating-review-separator">•</span>
                            <span>{new Date(r.created_at).toLocaleString()}</span>
                        </div>
                        {currentUserId === r.author_id ? (
                            <div className="rating-review-actions">
                                <button
                                    type="button"
                                    className="rating-review-action-secondary"
                                    onClick={() => {
                                        setEditingReviewId(r.id);
                                        setDraftBody(r.body);
                                        setError(null);
                                    }}
                                    disabled={loadingReviewId === r.id}
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    className="rating-review-action-danger"
                                    onClick={() => deleteReview(r.id)}
                                    disabled={loadingReviewId === r.id}
                                >
                                    {loadingReviewId === r.id ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        ) : null}
                    </div>
                    {editingReviewId === r.id ? (
                        <div className="rating-review-edit-wrap">
                            <textarea
                                value={draftBody}
                                onChange={(e) => setDraftBody(e.target.value)}
                                rows={3}
                                className="rating-review-textarea"
                                disabled={loadingReviewId === r.id}
                            />
                            <div className="rating-review-actions">
                                <button
                                    type="button"
                                    className="rating-review-submit"
                                    onClick={() => saveReview(r.id)}
                                    disabled={loadingReviewId === r.id}
                                >
                                    {loadingReviewId === r.id ? "Saving..." : "Save"}
                                </button>
                                <button
                                    type="button"
                                    className="rating-review-action-secondary"
                                    onClick={() => {
                                        setEditingReviewId(null);
                                        setDraftBody("");
                                        setError(null);
                                    }}
                                    disabled={loadingReviewId === r.id}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="rating-review-body">{r.body}</div>
                    )}
                </div>
            ))}
        </div>
    );
}
