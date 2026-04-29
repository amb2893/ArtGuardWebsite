import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { verifyToken } from "../../../lib/auth";
import { isAdmin, getOpenReports, getClosedReports } from "../../../lib/db";
import ReopenButton from "../case-history/ReopenButton";

const TYPE_LABELS: Record<string, string> = {
  user: "User",
  article: "Article",
  article_comment: "Article Comment",
  forum_post: "Forum Post",
  forum_comment: "Forum Comment",
  review: "Review",
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? verifyToken(token) : null;
  if (!user) return notFound();
  if (!(await isAdmin(user.id))) return notFound();

  const { tab } = await searchParams;
  const showClosed = tab === "closed";

  const reports = showClosed ? await getClosedReports() : await getOpenReports();

  return (
    <div className="articles-page">
      <header className="articles-header">
        <div>
          <p className="articles-eyebrow">Admin</p>
          <h1 className="articles-title">Reports</h1>
          <p className="articles-subtitle">
            {showClosed
              ? "Resolved and dismissed reports. Reopen any case to move it back to the review queue."
              : "User-submitted reports awaiting review. Click a report to see the flagged content and take action."}
          </p>
        </div>
        <div style={{ alignSelf: "flex-start" }}>
          <Link href="/admin" className="article-link">← Admin Hub</Link>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "2px solid var(--color-border)", maxWidth: 1000, margin: "0 auto 24px" }}>
        <Link
          href="/admin/reports"
          style={{
            padding: "0.5rem 1.1rem",
            fontWeight: 600,
            fontSize: "0.9rem",
            textDecoration: "none",
            borderBottom: showClosed ? "none" : "2px solid var(--color-primary)",
            color: showClosed ? "var(--color-text-muted)" : "var(--color-primary)",
            marginBottom: -2,
          }}
        >
          Open Cases
        </Link>
        <Link
          href="/admin/reports?tab=closed"
          style={{
            padding: "0.5rem 1.1rem",
            fontWeight: 600,
            fontSize: "0.9rem",
            textDecoration: "none",
            borderBottom: showClosed ? "2px solid var(--color-primary)" : "none",
            color: showClosed ? "var(--color-primary)" : "var(--color-text-muted)",
            marginBottom: -2,
          }}
        >
          Case History
        </Link>
      </div>

      <section className="articles-list">
        {reports.length === 0 ? (
          <div className="article-card">
            <p className="article-body">
              {showClosed ? "No closed cases yet." : "No open reports — everything looks good!"}
            </p>
          </div>
        ) : (
          reports.map((r: any) => (
            <article key={r.id} className="article-card">
              <div className="article-content">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                  <span className="report-type-badge">
                    {TYPE_LABELS[r.content_type] ?? r.content_type}
                  </span>
                  <span className="article-comments-muted">#{r.content_id}</span>
                  {showClosed && (
                    <span className={`report-status-badge report-status-${r.status}`}>
                      {r.status}
                    </span>
                  )}
                </div>

                <p className="article-body" style={{ marginBottom: 6 }}>
                  {r.reason}
                </p>

                {showClosed && r.resolution_note && (
                  <p style={{ color: "var(--color-text-secondary)", fontStyle: "italic", fontSize: "0.9rem", marginBottom: 6 }}>
                    Note: {r.resolution_note}
                  </p>
                )}

                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <span className="article-comments-muted">
                    Reported by {r.reporter_username}
                    {showClosed && r.resolved_by_username && ` · Closed by ${r.resolved_by_username}`}
                    {showClosed && r.resolved_at
                      ? ` on ${new Date(r.resolved_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`
                      : !showClosed && ` · ${new Date(r.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`}
                  </span>
                  <Link className="article-link" href={`/admin/reports/${r.id}`}>
                    {showClosed ? "View →" : "Review →"}
                  </Link>
                  {showClosed && <ReopenButton reportId={r.id} />}
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
