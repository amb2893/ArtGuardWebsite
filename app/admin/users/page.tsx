import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { verifyToken } from "../../../lib/auth";
import { isAdmin, getAllUsers } from "../../../lib/db";
import UserActions from "./UserActions";

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? verifyToken(token) : null;
  if (!user) return notFound();
  if (!(await isAdmin(user.id))) return notFound();

  const users = await getAllUsers();

  return (
    <div className="articles-page">
      <header className="articles-header">
        <div>
          <p className="articles-eyebrow">Admin</p>
          <h1 className="articles-title">User Management</h1>
          <p className="articles-subtitle">
            Promote users to trusted status to allow them to submit articles directly, or revoke trust.
          </p>
        </div>
        <div style={{ alignSelf: "flex-start" }}>
          <Link href="/admin" className="article-link">← Admin Hub</Link>
        </div>
      </header>

      <section className="articles-list">
        {users.map((u: any) => (
          <div key={u.id} className="article-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>{u.username}</span>
                  {u.is_admin && (
                    <span className="admin-role-badge admin-role-badge-admin">Admin</span>
                  )}
                  {u.is_trusted && !u.is_admin && (
                    <span className="admin-role-badge admin-role-badge-trusted">Trusted</span>
                  )}
                  {u.is_banned && (
                    <span className="admin-role-badge admin-role-badge-banned">Banned</span>
                  )}
                </div>
                <span className="article-comments-muted">
                  Joined{" "}
                  {new Date(u.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              {!u.is_admin && u.id !== user.id && (
                <UserActions userId={u.id} isTrusted={u.is_trusted} isBanned={u.is_banned} />
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
