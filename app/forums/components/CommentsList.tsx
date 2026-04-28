"use client";

import React, { useMemo, useState } from "react";
import { Comment } from "../../../lib/types";

interface Props {
    comments: Comment[];
    currentUsername: string | null;
    onUpdated: (c: Comment) => void;
    onDeleted: (commentId: number) => void;
}

export default function CommentsList({ comments, currentUsername, onUpdated, onDeleted }: Props) {
    const normalizedCurrentUsername = useMemo(
        () => (typeof currentUsername === "string" ? currentUsername.trim().toLowerCase() : ""),
        [currentUsername]
    );
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editBody, setEditBody] = useState("");
    const [busyId, setBusyId] = useState<number | null>(null);
    const [errorById, setErrorById] = useState<Record<number, string | null>>({});

    if (!comments || comments.length === 0) {
        return <div className="forum-comments-empty">No comments yet.</div>;
    }

    function canEdit(comment: Comment): boolean {
        if (!normalizedCurrentUsername) return false;
        return (comment.username ?? "").trim().toLowerCase() === normalizedCurrentUsername;
    }

    function startEdit(comment: Comment) {
        setEditingId(comment.id);
        setEditBody(comment.body);
        setErrorById((prev) => ({ ...prev, [comment.id]: null }));
    }

    function cancelEdit() {
        setEditingId(null);
        setEditBody("");
    }

    async function saveEdit(comment: Comment) {
        const body = editBody.trim();
        if (!body) {
            setErrorById((prev) => ({ ...prev, [comment.id]: "Comment cannot be empty." }));
            return;
        }

        setBusyId(comment.id);
        setErrorById((prev) => ({ ...prev, [comment.id]: null }));

        try {
            const res = await fetch(`/api/forums/${comment.post_id}/comments/${comment.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ body }),
            });

            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                setErrorById((prev) => ({ ...prev, [comment.id]: json?.error || "Failed to update comment." }));
                return;
            }

            const updated: Comment = await res.json();
            onUpdated(updated);
            cancelEdit();
        } catch {
            setErrorById((prev) => ({ ...prev, [comment.id]: "Network error." }));
        } finally {
            setBusyId(null);
        }
    }

    async function removeComment(comment: Comment) {
        if (!confirm("Delete this comment?")) return;

        setBusyId(comment.id);
        setErrorById((prev) => ({ ...prev, [comment.id]: null }));

        try {
            const res = await fetch(`/api/forums/${comment.post_id}/comments/${comment.id}`, {
                method: "DELETE",
                credentials: "same-origin",
            });

            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                setErrorById((prev) => ({ ...prev, [comment.id]: json?.error || "Failed to delete comment." }));
                return;
            }

            onDeleted(comment.id);
        } catch {
            setErrorById((prev) => ({ ...prev, [comment.id]: "Network error." }));
        } finally {
            setBusyId(null);
        }
    }

    return (
        <div className="forum-comments-stack">
            {comments.map((c) => (
                <div key={c.id} className="forum-comment-card">
                    <div className="forum-comment-meta">
                        <strong>{c.username ?? "Unknown"}</strong> - {new Date(c.created_at).toLocaleString()}
                    </div>
                    {editingId === c.id ? (
                        <>
                            <textarea
                                value={editBody}
                                onChange={(e) => setEditBody(e.target.value)}
                                className="forum-comment-textarea"
                                rows={3}
                                disabled={busyId === c.id}
                            />
                            <div className="forum-comment-actions">
                                <button
                                    type="button"
                                    className="forum-comment-action-btn"
                                    onClick={() => saveEdit(c)}
                                    disabled={busyId === c.id}
                                >
                                    {busyId === c.id ? "Saving..." : "Save"}
                                </button>
                                <button
                                    type="button"
                                    className="forum-comment-action-btn-secondary"
                                    onClick={cancelEdit}
                                    disabled={busyId === c.id}
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="forum-comment-body">{c.body}</div>
                    )}

                    {canEdit(c) && editingId !== c.id && (
                        <div className="forum-comment-actions">
                            <button
                                type="button"
                                className="forum-comment-action-btn-secondary"
                                onClick={() => startEdit(c)}
                                disabled={busyId === c.id}
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                className="forum-comment-action-btn-danger"
                                onClick={() => removeComment(c)}
                                disabled={busyId === c.id}
                            >
                                {busyId === c.id ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    )}

                    {errorById[c.id] && <div className="forum-comment-error">{errorById[c.id]}</div>}
                </div>
            ))}
        </div>
    );
}