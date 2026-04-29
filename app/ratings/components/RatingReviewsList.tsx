"use client";

import { useState } from "react";
import { RatingReview } from "../../../lib/types";
import ReviewTagSelector from "./ReviewTagSelector";
import ReportButton from "../../components/ReportButton";

interface Props {
    reviews: RatingReview[];
    currentUserId: number | null;
    isAdmin: boolean;
    onUpdate: (reviewId: number, body: string, tags: string[]) => Promise<void>;
    onDelete: (reviewId: number) => Promise<void>;
}

export default function RatingReviewsList({ reviews, currentUserId, isAdmin, onUpdate, onDelete }: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingBody, setEditingBody] = useState("");
    const [editingTags, setEditingTags] = useState<string[]>([]);
    const [working, setWorking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function beginEdit(review: RatingReview) {
        setEditingId(review.id);
        setEditingBody(review.body);
        setEditingTags(Array.isArray(review.tags) ? review.tags : []);
        setError(null);
    }

    function cancelEdit() {
        setEditingId(null);
        setEditingBody("");
        setEditingTags([]);
        setError(null);
    }

    async function saveEdit(reviewId: number) {
        setError(null);
        if (!editingBody.trim()) {
            setError("Review cannot be empty.");
            return;
        }

        setWorking(true);
        try {
            await onUpdate(reviewId, editingBody.trim(), editingTags);
            cancelEdit();
        } catch (err) {
            setError("Could not update review.");
        } finally {
            setWorking(false);
        }
    }

    async function removeReview(reviewId: number) {
        if (!confirm("Delete this review?")) return;
        setError(null);
        setWorking(true);
        try {
            await onDelete(reviewId);
            if (editingId === reviewId) cancelEdit();
        } catch (err) {
            setError("Could not delete review.");
        } finally {
            setWorking(false);
        }
    }

    if (!reviews || reviews.length === 0) return <div className="rating-reviews-muted">No reviews yet.</div>;

    return (
        <div className="rating-reviews-list">
            {error && <div className="rating-reviews-error">{error}</div>}
            {reviews.map((r) => {
                const isOwner = currentUserId === r.author_id;
                const canDelete = isOwner || isAdmin;

                return (
                    <div key={r.id} className="rating-review">
                        <div className="rating-review-meta">
                            <strong>{r.username ?? "Unknown"}</strong> - {new Date(r.created_at).toLocaleString()}
                        </div>
                        {editingId === r.id ? (
                            <div className="rating-review-edit">
                                <textarea
                                    value={editingBody}
                                    onChange={(e) => setEditingBody(e.target.value)}
                                    rows={4}
                                    className="rating-review-textarea"
                                    disabled={working}
                                    aria-label="Edit review"
                                />
                                <ReviewTagSelector
                                    selectedTags={editingTags}
                                    onChange={setEditingTags}
                                    disabled={working}
                                    idPrefix={`edit-review-tag-${r.id}`}
                                />
                                <div className="rating-review-actions">
                                    <button
                                        type="button"
                                        className="rating-review-action-btn"
                                        onClick={() => saveEdit(r.id)}
                                        disabled={working}
                                    >
                                        {working ? "Saving..." : "Save"}
                                    </button>
                                    <button
                                        type="button"
                                        className="rating-review-action-btn rating-review-action-btn-secondary"
                                        onClick={cancelEdit}
                                        disabled={working}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="rating-review-body">{r.body}</div>
                                {Array.isArray(r.tags) && r.tags.length > 0 && (
                                    <div className="rating-review-tag-list" aria-label="Review tags">
                                        {r.tags.map((tag) => (
                                            <span key={`${r.id}-${tag}`} className="rating-review-tag-chip">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="rating-review-actions">
                                    {isOwner && (
                                        <button
                                            type="button"
                                            className="rating-review-action-btn"
                                            onClick={() => beginEdit(r)}
                                            disabled={working}
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {canDelete && (
                                        <button
                                            type="button"
                                            className="rating-review-action-btn rating-review-action-btn-danger"
                                            onClick={() => removeReview(r.id)}
                                            disabled={working}
                                        >
                                            {working ? "Working..." : "Delete"}
                                        </button>
                                    )}
                                    <ReportButton contentType="review" contentId={r.id} authorId={r.author_id} authorUsername={r.username ?? undefined} />
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
