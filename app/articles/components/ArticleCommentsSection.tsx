"use client";

import React, { useEffect, useState } from "react";
import { ArticleComment } from "../../../lib/types";
import ArticleCommentsList from "./ArticleCommentsList";
import NewArticleCommentForm from "./NewArticleCommentForm";

interface Props {
    articleId: number;
}

export default function ArticleCommentsSection({ articleId }: Props) {
    const [comments, setComments] = useState<ArticleComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const [commentsRes, meRes] = await Promise.all([
                    fetch(`/api/articles/${articleId}/comments`, { credentials: "same-origin" }),
                    fetch("/api/me", { credentials: "same-origin", cache: "no-store" }),
                ]);

                if (!commentsRes.ok) {
                    setError("Failed to load comments.");
                    return;
                }

                const data: ArticleComment[] = await commentsRes.json();
                if (!cancelled) setComments(data);

                if (meRes.ok && !cancelled) {
                    const me = (await meRes.json()) as { id?: number | null };
                    setCurrentUserId(typeof me.id === "number" ? me.id : null);
                }
            } catch (err) {
                if (!cancelled) setError("Network error.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [articleId]);

    function handleNewComment(c: ArticleComment) {
        setComments((prev) => [...prev, c]);
    }

    function handleUpdatedComment(updated: ArticleComment) {
        setComments((prev) => prev.map((comment) => (comment.id === updated.id ? updated : comment)));
    }

    function handleDeletedComment(commentId: number) {
        setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    }

    return (
        <div className="article-comments">
            <div className="article-comments-header">
                <h3>Comments</h3>
            </div>
            <NewArticleCommentForm articleId={articleId} onCreated={handleNewComment} />
            <div className="article-comments-body">
                {loading && <div className="article-comments-muted">Loading comments...</div>}
                {error && <div className="article-comments-error">{error}</div>}
                {!loading && !error && (
                    <ArticleCommentsList
                        comments={comments}
                        articleId={articleId}
                        currentUserId={currentUserId}
                        onUpdated={handleUpdatedComment}
                        onDeleted={handleDeletedComment}
                    />
                )}
            </div>
        </div>
    );
}
