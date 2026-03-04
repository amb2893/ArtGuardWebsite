"use client";

import React from "react";
import { RatingReview } from "../../../lib/types";

interface Props {
    reviews: RatingReview[];
}

export default function RatingReviewsList({ reviews }: Props) {
    if (!reviews || reviews.length === 0) return <div className="rating-reviews-muted">No reviews yet.</div>;

    return (
        <div className="rating-reviews-list">
            {reviews.map((r) => (
                <div key={r.id} className="rating-review">
                    <div className="rating-review-meta">
                        <strong>{r.username ?? "Unknown"}</strong> - {new Date(r.created_at).toLocaleString()}
                    </div>
                    <div className="rating-review-body">{r.body}</div>
                </div>
            ))}
        </div>
    );
}
