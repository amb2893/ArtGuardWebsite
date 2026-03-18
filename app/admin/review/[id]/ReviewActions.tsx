"use client";

import React, { useState } from "react";

export default function ReviewActions({ articleId }: { articleId: number }) {
  const [loading, setLoading] = useState<"approve" | "deny" | null>(null);

  async function act(kind: "approve" | "deny") {
    setLoading(kind);

    const res = await fetch(`/api/admin/articles/${articleId}/${kind}`, {
      method: "POST",
      credentials: "same-origin",
    });

    const json = await res.json().catch(() => ({}));
    setLoading(null);

    if (!res.ok) {
      alert(json?.error || `Failed to ${kind}`);
      return;
    }

    alert(kind === "approve" ? "Article approved and published!" : "Article denied and deleted.");
    window.location.href = "/articles";
  }

  return (
    <div className="review-actions">
      <button
        type="button"
        className="btn-success"
        disabled={loading !== null}
        onClick={() => act("approve")}
      >
        {loading === "approve" ? "Approving..." : "Approve"}
      </button>

      <button
        type="button"
        className="btn-danger"
        disabled={loading !== null}
        onClick={() => act("deny")}
      >
        {loading === "deny" ? "Denying..." : "Deny"}
      </button>
    </div>
  );
}