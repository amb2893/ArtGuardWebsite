import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { verifyToken } from "../../../../lib/auth";
import { isAdmin, getReportById, getReportedContent, getReportsAgainstUser } from "../../../../lib/db";
import ReportActions from "./ReportActions";

const TYPE_LABELS: Record<string, string> = {
  user: "User",
  article: "Article",
  article_comment: "Article Comment",
  forum_post: "Forum Post",
  forum_comment: "Forum Comment",
  review: "Review",
};

function ContentPreview({
  contentType,
  content,
}: {
  contentType: string;
  content: any;
}) {
  if (!content) {
    return (
      <p style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>
        This content has already been deleted.
      </p>
    );
  }

  switch (contentType) {
    case "user":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <p>
            <strong>Username:</strong> {content.username}
          </p>
          <p>
            <strong>Role:</strong>{" "}
            {content.is_admin ? "Admin" : content.is_trusted ? "Trusted" : "Regular user"}
          </p>
          <p>
            <strong>Joined:</strong>{" "}
            {new Date(content.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      );

    case "article":
      return (
        <div>
          <h3 style={{ marginBottom: 8, fontWeight: 700 }}>{content.title}</h3>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 8 }}>{content.blurb}</p>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: 10 }}>
            By {content.author} · Status: {content.status}
          </p>
          <Link href={`/articles/${content.id}`} className="article-link">
            View article →
          </Link>
        </div>
      );

    case "article_comment":
      return (
        <div>
          <p style={{ whiteSpace: "pre-wrap", marginBottom: 8 }}>{content.body}</p>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
            By {content.author} ·{" "}
            <Link href={`/articles/${content.article_id}`}>View article →</Link>
          </p>
        </div>
      );

    case "forum_post":
      return (
        <div>
          <h3 style={{ marginBottom: 8, fontWeight: 700 }}>{content.title}</h3>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 8 }}>
            {content.body.length > 400 ? content.body.slice(0, 400) + "…" : content.body}
          </p>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: 10 }}>
            By {content.author}
          </p>
          <Link href={`/forums/${content.id}`} className="article-link">
            View post →
          </Link>
        </div>
      );

    case "forum_comment":
      return (
        <div>
          <p style={{ whiteSpace: "pre-wrap", marginBottom: 8 }}>{content.body}</p>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
            By {content.author} ·{" "}
            <Link href={`/forums/${content.post_id}`}>View thread →</Link>
          </p>
        </div>
      );

    case "review":
      return (
        <div>
          <p style={{ whiteSpace: "pre-wrap", marginBottom: 8 }}>{content.body}</p>
          {content.tags?.length > 0 && (
            <div
              style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}
            >
              {content.tags.map((tag: string) => (
                <span key={tag} className="rating-review-tag-chip">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
            By {content.author} ·{" "}
            <Link href={`/ratings/${content.website_id}`}>View website →</Link>
          </p>
        </div>
      );

    default:
      return (
        <pre style={{ fontSize: "0.85rem", overflowX: "auto" }}>
          {JSON.stringify(content, null, 2)}
        </pre>
      );
  }
}

export default async function AdminReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (Number.isNaN(id)) return notFound();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? verifyToken(token) : null;
  if (!user) return notFound();
  if (!(await isAdmin(user.id))) return notFound();

  const report = await getReportById(id);
  if (!report) return notFound();

  const content = await getReportedContent(report.content_type, report.content_id);

  // Determine the user being reported (for user reports it's content_id; for content it's the author)
  const subjectUserId: number | null =
    report.content_type === "user" ? report.content_id : (content?.author_id ?? null);

  const [userReports] = await Promise.all([
    subjectUserId != null ? getReportsAgainstUser(subjectUserId) : Promise.resolve([]),
  ]);

  const isBanned = Boolean(content?.is_banned ?? false);

  return (
    <div style={{ padding: "40px 20px", maxWidth: 900, margin: "0 auto" }}>
      <Link href="/admin/reports" className="article-link" style={{ display: "inline-block", marginBottom: 24 }}>
        ← Back to Reports
      </Link>

      {/* Report metadata */}
      <div className="article-card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
          <span className="report-type-badge">
            {TYPE_LABELS[report.content_type] ?? report.content_type} #{report.content_id}
          </span>
          <span className={`report-status-badge report-status-${report.status}`}>
            {report.status}
          </span>
        </div>

        <p style={{ fontWeight: 700, marginBottom: 6 }}>Reason for report:</p>
        <p style={{ color: "var(--color-text-secondary)", fontStyle: "italic", marginBottom: 12 }}>
          "{report.reason}"
        </p>

        <p className="article-comments-muted">
          Reported by {report.reporter_username} on{" "}
          {new Date(report.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Reported content */}
      <div className="article-card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 16, fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)" }}>
          Reported Content
        </h2>
        <ContentPreview contentType={report.content_type} content={content} />
      </div>

      {/* Previous reports against this user */}
      {subjectUserId != null && userReports.length > 0 && (
        <div className="article-card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 16, fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)" }}>
            All Reports Against This User ({userReports.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {userReports.map((r: any) => (
              <div key={r.id} style={{ borderLeft: "3px solid var(--color-border)", paddingLeft: 12 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span className={`report-status-badge report-status-${r.status}`}>{r.status}</span>
                  <span className="article-comments-muted">
                    by {r.reporter_username} · {new Date(r.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>
                <p style={{ color: "var(--color-text-secondary)", fontStyle: "italic", fontSize: "0.9rem" }}>
                  "{r.reason}"
                </p>
                {r.id !== report.id && (
                  <Link href={`/admin/reports/${r.id}`} className="article-link" style={{ fontSize: "0.85rem" }}>
                    View report →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {report.status === "open" ? (
        <ReportActions
          reportId={report.id}
          contentType={report.content_type}
          contentDeleted={!content}
          subjectUserId={subjectUserId}
          isBanned={isBanned}
        />
      ) : (
        <div className="article-card">
          <p style={{ fontWeight: 700, marginBottom: 4 }}>
            {report.status === "resolved" ? "Resolved" : "Dismissed"}
            {report.resolved_by_username ? ` by ${report.resolved_by_username}` : ""}
            {report.resolved_at
              ? ` on ${new Date(report.resolved_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`
              : ""}
          </p>
          {report.resolution_note && (
            <p style={{ color: "var(--color-text-secondary)", marginTop: 6 }}>
              {report.resolution_note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
