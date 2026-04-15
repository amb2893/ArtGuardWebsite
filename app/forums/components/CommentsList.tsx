"use client";

import React, { useState } from "react";
import { Comment } from "../../../lib/types";

interface Props {
    comments: Comment[];
    postId: number;
    currentUserId: number | null;
    onUpdated: (comment: Comment) => void;
    onDeleted: (commentId: number) => void;
}

export default function CommentsList({ comments, postId, currentUserId, onUpdated, onDeleted }: Props) {
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [draftBody, setDraftBody] = useState("");
    const [loadingCommentId, setLoadingCommentId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (!comments || comments.length === 0) {
        return <div className="forum-comments-empty">No comments yet.</div>;
    }

    async function saveComment(commentId: number) {
        const trimmedBody = draftBody.trim();
        if (!trimmedBody) {
            setError("Comment cannot be empty.");
            return;
        }

        setError(null);
        setLoadingCommentId(commentId);
        try {
            const res = await fetch(`/api/forums/${postId}/comments/${commentId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ body: trimmedBody }),
            });

            if (!res.ok) {
                const json = (await res.json().catch(() => ({}))) as { error?: string };
                setError(json.error ?? "Failed to update comment.");
                return;
            }

            const updated = (await res.json()) as Comment;
            onUpdated(updated);
            setEditingCommentId(null);
            setDraftBody("");
        } catch {
            setError("Network error.");
        } finally {
            setLoadingCommentId(null);
        }
    }

    async function deleteComment(commentId: number) {
        setError(null);
        setLoadingCommentId(commentId);
        try {
            const res = await fetch(`/api/forums/${postId}/comments/${commentId}`, {
                method: "DELETE",
                credentials: "same-origin",
            });

            if (!res.ok) {
                const json = (await res.json().catch(() => ({}))) as { error?: string };
                setError(json.error ?? "Failed to delete comment.");
                return;
            }

            onDeleted(commentId);
            if (editingCommentId === commentId) {
                setEditingCommentId(null);
                setDraftBody("");
            }
        } catch {
            setError("Network error.");
        } finally {
            setLoadingCommentId(null);
        }
    }

    return (
        <div className="forum-comments-stack">
            {error ? <div className="forum-comment-error">{error}</div> : null}
            {comments.map((c) => (
                <div key={c.id} className="forum-comment-card">
                    <div className="forum-comment-header">
                        <div className="forum-comment-meta">
                            <strong className="forum-comment-author">{c.username ?? "Unknown"}</strong>
                            <span className="forum-comment-separator">•</span>
                            <span>{new Date(c.created_at).toLocaleString()}</span>
                        </div>
                        {currentUserId === c.author_id ? (
                            <div className="forum-comment-actions">
                                <button
                                    type="button"
                                    className="forum-comment-action-secondary"
                                    onClick={() => {
                                        setEditingCommentId(c.id);
                                        setDraftBody(c.body);
                                        setError(null);
                                    }}
                                    disabled={loadingCommentId === c.id}
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    className="forum-comment-action-danger"
                                    onClick={() => deleteComment(c.id)}
                                    disabled={loadingCommentId === c.id}
                                >
                                    {loadingCommentId === c.id ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        ) : null}
                    </div>
                    {editingCommentId === c.id ? (
                        <div className="forum-comment-edit-wrap">
                            <textarea
                                value={draftBody}
                                onChange={(e) => setDraftBody(e.target.value)}
                                rows={3}
                                className="forum-comment-textarea"
                                disabled={loadingCommentId === c.id}
                            />
                            <div className="forum-comment-actions">
                                <button
                                    type="button"
                                    className="forum-comment-submit"
                                    onClick={() => saveComment(c.id)}
                                    disabled={loadingCommentId === c.id}
                                >
                                    {loadingCommentId === c.id ? "Saving..." : "Save"}
                                </button>
                                <button
                                    type="button"
                                    className="forum-comment-action-secondary"
                                    onClick={() => {
                                        setEditingCommentId(null);
                                        setDraftBody("");
                                        setError(null);
                                    }}
                                    disabled={loadingCommentId === c.id}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="forum-comment-body">{c.body}</div>
                    )}
                </div>
            ))}
        </div>
    );
}