"use client";

import { useState } from "react";

export default function ReopenButton({ reportId }: { reportId: number }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function reopen() {
    if (!confirm("Reopen this case? It will move back to the open reports queue.")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/reports/${reportId}/reopen`, {
      method: "POST",
      credentials: "same-origin",
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
    } else {
      const json = await res.json().catch(() => ({}));
      alert(json?.error || "Failed to reopen report.");
    }
  }

  if (done) return <span style={{ color: "var(--color-success)", fontWeight: 600, fontSize: "0.85rem" }}>Moved to open queue</span>;

  return (
    <button
      type="button"
      className="article-comment-action-btn-secondary"
      onClick={reopen}
      disabled={loading}
      style={{ fontSize: "0.85rem" }}
    >
      {loading ? "Working..." : "Reopen"}
    </button>
  );
}
