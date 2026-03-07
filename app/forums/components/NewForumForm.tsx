"use client";

import React, { useState } from "react";
import { ForumPost } from "../../../lib/types";

interface Props {
    onCreated: (post: ForumPost) => void;
}

export default function NewForumForm({ onCreated }: Props) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const errorId = error ? "new-topic-error" : undefined;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!title.trim() || !body.trim()) {
            setError("Title and body are required.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/forums", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: title.trim(), body: body.trim() }),
                credentials: "same-origin",
            });

            if (res.status === 401) {
                setError("You must be logged in to create a forum post.");
                return;
            }

            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                setError(json?.message || "Failed to create post.");
                return;
            }

            const created: ForumPost = await res.json();
            onCreated(created);
            setTitle("");
            setBody("");
        } catch (err) {
            setError("Network error.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="forums-form">
            <div className="forums-form-header">
                <h2>Start a Topic</h2>
            </div>
            {error && <div className="forums-error" id="new-topic-error" role="alert" aria-live="assertive">{error}</div>}
            <label className="forums-field">
                <span>Title</span>
                <input
                    id="forum-topic-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your topic a clear title"
                    title="Enter the title of your forum topic"
                    className="forums-input"
                    required
                    aria-invalid={Boolean(error)}
                    aria-describedby={errorId}
                />
            </label>
            <label className="forums-field">
                <span>Message</span>
                <textarea
                    id="forum-topic-message"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Share context, links, or questions"
                    title="Enter your forum topic message or content"
                    rows={6}
                    className="forums-textarea"
                    required
                    aria-invalid={Boolean(error)}
                    aria-describedby={errorId}
                />
            </label>
            <button type="submit" className="forums-submit" disabled={loading}>
                {loading ? "Posting..." : "Create Topic"}
            </button>
        </form>
    );
}