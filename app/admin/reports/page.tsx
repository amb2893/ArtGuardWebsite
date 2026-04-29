import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { verifyToken } from "../../../lib/auth";
import { isAdmin, getOpenReports } from "../../../lib/db";

const TYPE_LABELS: Record<string, string> = {
  user: "User",
  article: "Article",
  article_comment: "Article Comment",
  forum_post: "Forum Post",
  forum_comment: "Forum Comment",
  review: "Review",
};

export default async function AdminReportsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? verifyToken(token) : null;
  if (!user) return notFound();
  if (!(await isAdmin(user.id))) return notFound();

  const reports = await getOpenReports();

  return (
    <div className="articles-page">
      <header className="articles-header">
        <div>
          <p className="articles-eyebrow">Admin</p>
          <h1 className="articles-title">Reports</h1>
          <p className="articles-subtitle">
            User-submitted reports awaiting review. Click a report to see the flagged content and take action.
          </p>
        </div>
        <div style={{ alignSelf: "flex-start" }}>
          <Link href="/admin" className="article-link">← Admin Hub</Link>
        </div>
      </header>

      <section className="articles-list">
        {reports.length === 0 ? (
          <div className="article-card">
            <p className="article-body">No open reports — everything looks good!</p>
          </div>
        ) : (
          reports.map((r: any) => (
            <article key={r.id} className="article-card">
              <div className="article-content">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span className="report-type-badge">
                    {TYPE_LABELS[r.content_type] ?? r.content_type}
                  </span>
                  <span className="article-comments-muted">#{r.content_id}</span>
                </div>

                <p className="article-body" style={{ marginBottom: 8 }}>
                  {r.reason}
                </p>

                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <span className="article-comments-muted">
                    Reported by {r.reporter_username} ·{" "}
                    {new Date(r.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <Link className="article-link" href={`/admin/reports/${r.id}`}>
                    Review →
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
