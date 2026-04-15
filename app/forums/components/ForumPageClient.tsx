"use client";

import React, { useEffect, useState } from "react";
import { ForumPost, Comment } from "../../../lib/types";
import CommentsList from "./CommentsList";
import NewCommentForm from "./NewCommentForm";

interface Props {
    post: ForumPost;
    initialComments: Comment[];
}

export default function ForumPageClient({ post, initialComments }: Props) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadCurrentUser() {
            try {
                const res = await fetch("/api/me", {
                    credentials: "same-origin",
                    cache: "no-store",
                });
                if (!res.ok || cancelled) return;

                const me = (await res.json()) as { id?: number | null };
                if (!cancelled) setCurrentUserId(typeof me.id === "number" ? me.id : null);
            } catch {
                if (!cancelled) setCurrentUserId(null);
            }
        }

        loadCurrentUser();
        return () => {
            cancelled = true;
        };
    }, []);

    function handleNewComment(c: Comment) {
        setComments((prev) => [...prev, c]);
    }

    function handleUpdatedComment(updated: Comment) {
        setComments((prev) => prev.map((comment) => (comment.id === updated.id ? updated : comment)));
    }

    function handleDeletedComment(commentId: number) {
        setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    }

    return (
        <div className="forum-post-layout">
            <article className="forum-post-card">
                <p className="forum-post-eyebrow">Forum Thread</p>
                <h1 className="forum-post-title">{post.title}</h1>
                <p className="forum-post-body">{post.body}</p>
                <div className="forum-post-meta">
                    By {post.username} - {new Date(post.created_at).toLocaleString()}
                </div>
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
                    postId={post.id}
                    currentUserId={currentUserId}
                    onUpdated={handleUpdatedComment}
                    onDeleted={handleDeletedComment}
                />
            </section>
        </div>
    );
}