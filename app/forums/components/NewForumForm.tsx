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
        <form onSubmit={handleSubmit} className="max-w-2xl">
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full p-2 border rounded mb-2"
            />
            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Body"
                rows={6}
                className="w-full p-2 border rounded mb-2"
            />
            <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                disabled={loading}
            >
                {loading ? "Posting..." : "Create Forum"}
            </button>
        </form>
    );
}