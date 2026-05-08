import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { verifyToken } from "../../lib/auth";
import { isAdmin, getPendingArticlesCount, getOpenReportsCount } from "../../lib/db";

export default async function AdminHubPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? verifyToken(token) : null;
  if (!user) return notFound();
  if (!(await isAdmin(user.id))) return notFound();

  const [pendingCount, reportsCount] = await Promise.all([
    getPendingArticlesCount(),
    getOpenReportsCount(),
  ]);

  return (
    <div className="articles-page">
      <header className="articles-header">
        <div>
          <p className="articles-eyebrow">Admin</p>
          <h1 className="articles-title">Admin Hub</h1>
          <p className="articles-subtitle">
            Manage articles, users, and reported content.
          </p>
        </div>
      </header>

      <div className="admin-hub-grid">
        <Link href="/admin/review" className="admin-hub-card">
          <div className="admin-hub-card-icon" aria-hidden="true">📄</div>
          <div className="admin-hub-card-body">
            <h2 className="admin-hub-card-title">Article Review</h2>
            <p className="admin-hub-card-desc">
              Review and approve or deny articles submitted by trusted users.
            </p>
          </div>
          {pendingCount > 0 && (
            <span className="admin-hub-badge">{pendingCount} pending</span>
          )}
        </Link>

        <Link href="/admin/users" className="admin-hub-card">
          <div className="admin-hub-card-icon" aria-hidden="true">👥</div>
          <div className="admin-hub-card-body">
            <h2 className="admin-hub-card-title">User Management</h2>
            <p className="admin-hub-card-desc">
              Promote users to trusted status or revoke trust to control who can submit articles.
            </p>
          </div>
        </Link>

        <Link href="/admin/reports" className="admin-hub-card">
          <div className="admin-hub-card-icon" aria-hidden="true">🚩</div>
          <div className="admin-hub-card-body">
            <h2 className="admin-hub-card-title">Reports</h2>
            <p className="admin-hub-card-desc">
              Handle reports submitted by users for articles, comments, reviews, and users.
            </p>
          </div>
          {reportsCount > 0 && (
            <span className="admin-hub-badge admin-hub-badge-red">{reportsCount} open</span>
          )}
        </Link>

      </div>
    </div>
  );
}
