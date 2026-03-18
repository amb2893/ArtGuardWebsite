"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Notif = {
  id: number;
  type: string;
  message: string;
  article_id: number | null;
  created_at: string;
  read_at: string | null;
};

export default function NavbarNotifications({ enabled }: { enabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Notif[]>([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  async function load() {
    if (!enabled) return;
    const res = await fetch("/api/notifications", { credentials: "same-origin", cache: "no-store" });
    if (!res.ok) return;
    const json = await res.json().catch(() => null);
    if (!json) return;
    setUnread(json.unread || 0);
    setItems(json.notifications || []);
  }

  useEffect(() => {
    if (!enabled) return;
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "POST", credentials: "same-origin" });
    await load();
  }

  if (!enabled) return null;

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={async () => {
          const next = !open;
          setOpen(next);
          if (next) await load();
        }}
        style={{
          background: "transparent",
          border: "1px solid #e2e7f0",
          color: "#111",
          padding: "0.4rem 0.75rem",
          borderRadius: 999,
          fontWeight: 700,
          position: "relative",
        }}
      >
        🔔
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              background: "#e11d48",
              color: "white",
              borderRadius: 999,
              fontSize: 12,
              padding: "2px 6px",
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            marginTop: 10,
            width: 360,
            background: "white",
            border: "1px solid #e6eaf2",
            borderRadius: 12,
            boxShadow: "0 16px 28px rgba(15, 26, 43, 0.12)",
            padding: 12,
            zIndex: 2000,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <strong>Notifications</strong>
            <button type="button" onClick={markAllRead} style={{ padding: "0.35rem 0.6rem" }}>
              Mark read
            </button>
          </div>

          {items.length === 0 ? (
            <div style={{ color: "#64748b" }}>No notifications.</div>
          ) : (
            <div style={{ display: "grid", gap: 8, maxHeight: 340, overflow: "auto" }}>
              {items.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    border: "1px solid #eef1f6",
                    background: n.read_at ? "#fafbfe" : "#fff7ed",
                  }}
                >
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{n.message}</div>

                  {n.article_id ? (
                    <Link href={`/articles/${n.article_id}`} onClick={() => setOpen(false)}>
                      View article
                    </Link>
                  ) : (
                    <span style={{ color: "#64748b" }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}