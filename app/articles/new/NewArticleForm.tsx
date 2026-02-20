"use client";

import React, { useState } from "react";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export default function NewArticleForm() {
  const [title, setTitle] = useState("");
  const [blurb, setBlurb] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Beginner");
  const [body, setBody] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !blurb.trim() || !body.trim()) {
      setError("Title, blurb, and body are required.");
      return;
    }

    setLoading(true);
    try {
      const createRes = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          title: title.trim(),
          blurb: blurb.trim(),
          difficulty,
          body: body.trim(),
        }),
      });

      const createJson = await createRes.json().catch(() => ({}));
      if (!createRes.ok) {
        setError(createJson?.error || "Failed to create article.");
        return;
      }

      const articleId = createJson.id;

      const pubRes = await fetch(`/api/admin/articles/${articleId}/publish`, {
        method: "POST",
        credentials: "same-origin",
      });

      const pubJson = await pubRes.json().catch(() => ({}));
      if (!pubRes.ok) {
        setError(pubJson?.error || "Failed to publish article.");
        return;
      }

      window.location.href = `/articles/${articleId}`;
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 900, margin: "0 auto" }}>
      <h1>Create Article</h1>

      <form onSubmit={handlePublish} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {error && <div style={{ color: "crimson" }}>{error}</div>}

        <label htmlFor="title">Title</label>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />

        <label htmlFor="difficulty">Difficulty</label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <label htmlFor="blurb">Blurb (shown on cards)</label>
        <textarea
          id="blurb"
          rows={3}
          value={blurb}
          onChange={(e) => setBlurb(e.target.value)}
          placeholder="A short summary shown on the article cards..."
        />

        <label htmlFor="body">Body</label>
        <textarea id="body" rows={14} value={body} onChange={(e) => setBody(e.target.value)} />

        <button type="submit" disabled={loading}>
          {loading ? "Publishing..." : "Publish"}
        </button>
      </form>
    </div>
  );
}
