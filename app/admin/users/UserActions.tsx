"use client";

import { useState } from "react";

export default function UserActions({
  userId,
  isTrusted,
  isBanned,
}: {
  userId: number;
  isTrusted: boolean;
  isBanned: boolean;
}) {
  const [trusted, setTrusted] = useState(isTrusted);
  const [banned, setBanned] = useState(isBanned);
  const [trustLoading, setTrustLoading] = useState(false);
  const [banLoading, setBanLoading] = useState(false);

  async function toggleTrust() {
    setTrustLoading(true);
    const res = await fetch(`/api/admin/users/${userId}/trust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trusted: !trusted }),
      credentials: "same-origin",
    });
    setTrustLoading(false);
    if (res.ok) {
      setTrusted(!trusted);
    } else {
      const json = await res.json().catch(() => ({}));
      alert(json?.error || "Failed to update trust status");
    }
  }

  async function toggleBan() {
    setBanLoading(true);
    const res = await fetch(`/api/admin/users/${userId}/ban`, {
      method: banned ? "DELETE" : "POST",
      credentials: "same-origin",
    });
    setBanLoading(false);
    if (res.ok) {
      setBanned(!banned);
    } else {
      const json = await res.json().catch(() => ({}));
      alert(json?.error || "Failed to update ban status");
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={toggleTrust}
        disabled={trustLoading || banned}
        className={trusted ? "btn-danger" : "btn-success"}
        style={{ minWidth: 160 }}
      >
        {trustLoading ? "Saving..." : trusted ? "Revoke Trust" : "Promote to Trusted"}
      </button>
      <button
        type="button"
        onClick={toggleBan}
        disabled={banLoading}
        className={banned ? "btn-success" : "article-comment-action-btn-danger"}
        style={{ minWidth: 120 }}
      >
        {banLoading ? "Working..." : banned ? "Unban" : "Ban"}
      </button>
    </div>
  );
}
