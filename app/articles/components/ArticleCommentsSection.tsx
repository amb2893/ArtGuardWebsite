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
    const [currentUsername, setCurrentUsername] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/articles/${articleId}/comments`, { credentials: "same-origin" });
                if (!res.ok) {
                    setError("Failed to load comments.");
                    return;
                }
                const data: ArticleComment[] = await res.json();
                if (!cancelled) setComments(data);
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

    function handleNewComment(c: ArticleComment) {
        setComments((prev) => [...prev, c]);
    }

    function handleUpdatedComment(updated: ArticleComment) {
        setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    }

    function handleDeletedComment(commentId: number) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
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
                        currentUsername={currentUsername}
                        onUpdated={handleUpdatedComment}
                        onDeleted={handleDeletedComment}
                    />
                )}
            </div>
        </div>
    );
}
