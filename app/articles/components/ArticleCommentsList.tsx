"use client";

import { useMemo, useState } from "react";
import { ArticleComment } from "../../../lib/types";
import ReportButton from "../../components/ReportButton";

interface Props {
    comments: ArticleComment[];
    currentUsername: string | null;
    isAdmin: boolean;
    onUpdated: (c: ArticleComment) => void;
    onDeleted: (commentId: number) => void;
}

export default function ArticleCommentsList({ comments, currentUsername, isAdmin, onUpdated, onDeleted }: Props) {
    const normalizedCurrentUsername = useMemo(
        () => (typeof currentUsername === "string" ? currentUsername.trim().toLowerCase() : ""),
        [currentUsername]
    );
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editBody, setEditBody] = useState("");
    const [busyId, setBusyId] = useState<number | null>(null);
    const [errorById, setErrorById] = useState<Record<number, string | null>>({});

    if (!comments || comments.length === 0) return <div className="article-comments-muted">No comments yet.</div>;

    function isOwner(comment: ArticleComment): boolean {
        if (!normalizedCurrentUsername) return false;
        return (comment.username ?? "").trim().toLowerCase() === normalizedCurrentUsername;
    }

    function canDelete(comment: ArticleComment): boolean {
        return isOwner(comment) || isAdmin;
    }

    function startEdit(comment: ArticleComment) {
        setEditingId(comment.id);
        setEditBody(comment.body);
        setErrorById((prev) => ({ ...prev, [comment.id]: null }));
    }

    function cancelEdit() {
        setEditingId(null);
        setEditBody("");
    }

    async function saveEdit(comment: ArticleComment) {
        const body = editBody.trim();
        if (!body) {
            setErrorById((prev) => ({ ...prev, [comment.id]: "Comment cannot be empty." }));
            return;
        }

        setBusyId(comment.id);
        setErrorById((prev) => ({ ...prev, [comment.id]: null }));

        try {
            const res = await fetch(`/api/articles/${comment.article_id}/comments/${comment.id}`, {
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

            const updated: ArticleComment = await res.json();
            onUpdated(updated);
            cancelEdit();
        } catch {
            setErrorById((prev) => ({ ...prev, [comment.id]: "Network error." }));
        } finally {
            setBusyId(null);
        }
    }

    async function removeComment(comment: ArticleComment) {
        if (!confirm("Delete this comment?")) return;

        setBusyId(comment.id);
        setErrorById((prev) => ({ ...prev, [comment.id]: null }));

        try {
            const res = await fetch(`/api/articles/${comment.article_id}/comments/${comment.id}`, {
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
        <div className="article-comments-list">
            {comments.map((c) => (
                <div key={c.id} className="article-comment">
                    <div className="article-comment-meta">
                        <strong>{c.username ?? "Unknown"}</strong> - {new Date(c.created_at).toLocaleString()}
                    </div>

                    {editingId === c.id ? (
                        <>
                            <textarea
                                value={editBody}
                                onChange={(e) => setEditBody(e.target.value)}
                                className="article-comment-textarea"
                                rows={3}
                                disabled={busyId === c.id}
                            />
                            <div className="article-comment-actions">
                                <button
                                    type="button"
                                    className="article-comment-action-btn"
                                    onClick={() => saveEdit(c)}
                                    disabled={busyId === c.id}
                                >
                                    {busyId === c.id ? "Saving..." : "Save"}
                                </button>
                                <button
                                    type="button"
                                    className="article-comment-action-btn-secondary"
                                    onClick={cancelEdit}
                                    disabled={busyId === c.id}
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="article-comment-body">{c.body}</div>
                    )}

                    {editingId !== c.id && (
                        <div className="article-comment-actions">
                            {isOwner(c) && (
                                <button
                                    type="button"
                                    className="article-comment-action-btn-secondary"
                                    onClick={() => startEdit(c)}
                                    disabled={busyId === c.id}
                                >
                                    Edit
                                </button>
                            )}
                            {canDelete(c) && (
                                <button
                                    type="button"
                                    className="article-comment-action-btn-danger"
                                    onClick={() => removeComment(c)}
                                    disabled={busyId === c.id}
                                >
                                    {busyId === c.id ? "Deleting..." : "Delete"}
                                </button>
                            )}
                            <ReportButton contentType="article_comment" contentId={c.id} authorId={c.author_id} authorUsername={c.username ?? undefined} />
                        </div>
                    )}

                    {errorById[c.id] && <div className="article-comments-error">{errorById[c.id]}</div>}
                </div>
            ))}
        </div>
    );
}
