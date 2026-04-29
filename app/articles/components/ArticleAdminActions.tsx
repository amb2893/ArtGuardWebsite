"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  articleId: number;
}

export default function ArticleAdminActions({ articleId }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("Delete this article permanently?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json?.error || "Failed to delete article.");
        return;
      }
      router.push("/articles");
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      {error && <p className="form-error">{error}</p>}
      <button
        type="button"
        className="article-comment-action-btn-danger"
        onClick={handleDelete}
        disabled={busy}
      >
        {busy ? "Deleting..." : "Delete Article"}
      </button>
    </div>
  );
}
