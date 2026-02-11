"use client";

import React, { useState } from "react";
import { ForumPost, Comment } from "../../../lib/types";
import CommentsList from "./CommentsList";
import NewCommentForm from "./NewCommentForm";

interface Props {
    post: ForumPost;
    initialComments: Comment[];
}

export default function ForumPageClient({ post, initialComments }: Props) {
    const [comments, setComments] = useState<Comment[]>(initialComments);

    function handleNewComment(c: Comment) {
        setComments((prev) => [...prev, c]);
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
                <CommentsList comments={comments} />
            </section>
        </div>
    );
}