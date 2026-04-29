"use client";

import { useState } from "react";

export default function ReportActions({
  reportId,
  contentType,
  contentDeleted,
  subjectUserId,
  isBanned,
}: {
  reportId: number;
  contentType: string;
  contentDeleted: boolean;
  subjectUserId: number | null;
  isBanned: boolean;
}) {
  const [showResolve, setShowResolve] = useState(false);
  const [note, setNote] = useState("");
  const [deleteContent, setDeleteContent] = useState(false);
  const [banUser, setBanUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [banLoading, setBanLoading] = useState(false);
  const [currentlyBanned, setCurrentlyBanned] = useState(isBanned);

  const canDelete = !contentDeleted && contentType !== "user";
  const canBan = subjectUserId != null;

  async function submit(kind: "resolve" | "dismiss") {
    setLoading(true);
    try {
      if (banUser && canBan && kind === "resolve") {
        await fetch(`/api/admin/users/${subjectUserId}/ban`, {
          method: "POST",
          credentials: "same-origin",
        });
        setCurrentlyBanned(true);
      }

      const body = kind === "resolve" ? { note, deleteContent } : {};
      const res = await fetch(`/api/admin/reports/${reportId}/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "same-origin",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json?.error || `Failed to ${kind} report`);
        return;
      }
      window.location.href = "/admin/reports";
    } finally {
      setLoading(false);
    }
  }

  async function toggleBan() {
    if (!canBan) return;
    setBanLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${subjectUserId}/ban`, {
        method: currentlyBanned ? "DELETE" : "POST",
        credentials: "same-origin",
      });
      if (res.ok) setCurrentlyBanned(!currentlyBanned);
      else {
        const json = await res.json().catch(() => ({}));
        alert(json?.error || "Failed to update ban status.");
      }
    } finally {
      setBanLoading(false);
    }
  }

  if (showResolve) {
    return (
      <div className="article-card">
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Resolve Report</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontWeight: 600, display: "flex", flexDirection: "column", gap: 4 }}>
            Resolution note (optional)
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe what action was taken..."
              rows={3}
              className="article-comment-textarea"
            />
          </label>

          {canDelete && (
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 600, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={deleteContent}
                onChange={(e) => setDeleteContent(e.target.checked)}
                style={{ width: "auto" }}
              />
              Also delete the reported content
            </label>
          )}

          {canBan && (
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 600, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={banUser}
                onChange={(e) => setBanUser(e.target.checked)}
                style={{ width: "auto" }}
              />
              {currentlyBanned ? "Keep user banned" : "Ban this user"}
            </label>
          )}

          <div className="review-actions">
            <button
              type="button"
              className="btn-success"
              onClick={() => submit("resolve")}
              disabled={loading}
            >
              {loading ? "Saving..." : "Confirm Resolve"}
            </button>
            <button
              type="button"
              className="article-comment-action-btn-secondary"
              onClick={() => setShowResolve(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
      <button type="button" className="btn-success" onClick={() => setShowResolve(true)}>
        Resolve Report
      </button>
      <button
        type="button"
        className="btn-danger"
        onClick={() => submit("dismiss")}
        disabled={loading}
      >
        {loading ? "Dismissing..." : "Dismiss"}
      </button>
      {canBan && (
        <button
          type="button"
          className={currentlyBanned ? "btn-success" : "article-comment-action-btn-danger"}
          onClick={toggleBan}
          disabled={banLoading}
          style={{ marginLeft: 8 }}
        >
          {banLoading ? "Working..." : currentlyBanned ? "Unban User" : "Ban User"}
        </button>
      )}
    </div>
  );
}
