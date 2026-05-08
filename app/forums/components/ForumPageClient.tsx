"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ForumPost, Comment } from "../../../lib/types";
import CommentsList from "./CommentsList";
import NewCommentForm from "./NewCommentForm";
import ReportButton from "../../components/ReportButton";

interface Props {
    post: ForumPost;
    initialComments: Comment[];
}

export default function ForumPageClient({ post, initialComments }: Props) {
    const router = useRouter();
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [currentUsername, setCurrentUsername] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // Post editing state
    const [editingPost, setEditingPost] = useState(false);
    const [editTitle, setEditTitle] = useState(post.title);
    const [editBody, setEditBody] = useState(post.body);
    const [postBusy, setPostBusy] = useState(false);
    const [postError, setPostError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadMe() {
            try {
                const res = await fetch("/api/me", { cache: "no-store", credentials: "same-origin" });
                if (!res.ok) return;
                const data = await res.json();
                if (!cancelled) {
                    setCurrentUsername(typeof data?.username === "string" ? data.username : null);
                    setIsAdmin(Boolean(data?.isAdmin));
                }
            } catch {
                if (!cancelled) setCurrentUsername(null);
            }
        }

        loadMe();
        return () => { cancelled = true; };
    }, []);

    const isPostOwner =
        currentUsername !== null &&
        currentUsername.trim().toLowerCase() === (post.username ?? "").trim().toLowerCase();

    async function savePostEdit() {
        const title = editTitle.trim();
        const body = editBody.trim();
        if (!title || !body) {
            setPostError("Title and body are required.");
            return;
        }
        setPostBusy(true);
        setPostError(null);
        try {
            const res = await fetch(`/api/forums/${post.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ title, body }),
            });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                setPostError(json?.error || "Failed to update post.");
                return;
            }
            setEditingPost(false);
            router.refresh();
        } catch {
            setPostError("Network error.");
        } finally {
            setPostBusy(false);
        }
    }

    async function deletePost() {
        if (!confirm("Delete this post and all its comments?")) return;
        setPostBusy(true);
        try {
            const res = await fetch(`/api/forums/${post.id}`, {
                method: "DELETE",
                credentials: "same-origin",
            });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                setPostError(json?.error || "Failed to delete post.");
                return;
            }
            router.push("/forums");
        } catch {
            setPostError("Network error.");
        } finally {
            setPostBusy(false);
        }
    }

    function handleNewComment(c: Comment) {
        setComments((prev) => [...prev, c]);
    }

    function handleUpdatedComment(updated: Comment) {
        setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    }

    function handleDeletedComment(commentId: number) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
    }

    return (
        <div className="forum-post-layout">
            <article className="forum-post-card">
                <p className="forum-post-eyebrow">Forum Thread</p>

                {editingPost ? (
                    <>
                        <input
                            className="article-comment-textarea"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            disabled={postBusy}
                            style={{ width: "100%", marginBottom: 8, fontWeight: 700, fontSize: "1.2rem" }}
                        />
                        <textarea
                            className="article-comment-textarea"
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            rows={6}
                            disabled={postBusy}
                            style={{ width: "100%" }}
                        />
                        {postError && <p className="form-error">{postError}</p>}
                        <div className="article-comment-actions" style={{ marginTop: 8 }}>
                            <button
                                type="button"
                                className="article-comment-action-btn"
                                onClick={savePostEdit}
                                disabled={postBusy}
                            >
                                {postBusy ? "Saving..." : "Save"}
                            </button>
                            <button
                                type="button"
                                className="article-comment-action-btn-secondary"
                                onClick={() => { setEditingPost(false); setPostError(null); }}
                                disabled={postBusy}
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h1 className="forum-post-title">{post.title}</h1>
                        <p className="forum-post-body">{post.body}</p>
                        <div className="forum-post-meta">
                            By {post.username} - {new Date(post.created_at).toLocaleString()}
                        </div>
                        {postError && <p className="form-error">{postError}</p>}
                        <div className="article-comment-actions" style={{ marginTop: 12 }}>
                            {isPostOwner && (
                                <button
                                    type="button"
                                    className="article-comment-action-btn-secondary"
                                    onClick={() => setEditingPost(true)}
                                    disabled={postBusy}
                                >
                                    Edit
                                </button>
                            )}
                            {(isPostOwner || isAdmin) && (
                                <button
                                    type="button"
                                    className="article-comment-action-btn-danger"
                                    onClick={deletePost}
                                    disabled={postBusy}
                                >
                                    {postBusy ? "Deleting..." : "Delete"}
                                </button>
                            )}
                            <ReportButton contentType="forum_post" contentId={post.id} authorId={post.author_id} authorUsername={post.username ?? undefined} />
                        </div>
                    </>
                )}
            </article>

            <section className="forum-comments-panel">
                <div className="forum-comments-header">
                    <h2 className="forum-comments-title">Join the discussion</h2>
                    <p className="forum-comments-subtitle">
                        Share a thought or add context to the thread.
                    </p>
                </div>
                <NewCommentForm postId={post.id} onCreated={handleNewComment} />
            </section>

            <section className="forum-comments-list">
                <CommentsList
                    comments={comments}
                    currentUsername={currentUsername}
                    isAdmin={isAdmin}
                    onUpdated={handleUpdatedComment}
                    onDeleted={handleDeletedComment}
                />
            </section>
        </div>
    );
}
