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
    const [currentUsername, setCurrentUsername] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadMe() {
            try {
                const res = await fetch("/api/me", { cache: "no-store", credentials: "same-origin" });
                if (!res.ok) return;

                const data = (await res.json()) as { username?: string | null };
                if (!cancelled) {
                    setCurrentUsername(typeof data?.username === "string" ? data.username : null);
                }
            } catch {
                if (!cancelled) setCurrentUsername(null);
            }
        }

        loadMe();
        return () => {
            cancelled = true;
        };
    }, []);

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
                    currentUsername={currentUsername}
                    onUpdated={handleUpdatedComment}
                    onDeleted={handleDeletedComment}
                />
            </section>
        </div>
    );
}