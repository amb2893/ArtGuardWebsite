import Link from "next/link";
import ReportButton from "../components/ReportButton";
import { cookies } from "next/headers";
import { verifyToken } from "../../lib/auth";
import {
  getFeaturedArticles,
  getPublishedArticlesWithCounts,
  isAdmin,
  isTrusted,
  getPendingArticlesCount,
} from "../../lib/db";

function difficultyClass(d: string) {
  if (d === "Beginner") return "difficulty-badge is-beginner";
  if (d === "Intermediate") return "difficulty-badge is-intermediate";
  return "difficulty-badge is-advanced";
}

export default async function ArticlesPage() {
  const [featured, articles] = await Promise.all([
    getFeaturedArticles(),
    getPublishedArticlesWithCounts(),
  ]);

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? verifyToken(token) : null;

  const [admin, trusted] = user
    ? await Promise.all([isAdmin(user.id), isTrusted(user.id)])
    : [false, false];

  const canCreate = admin || trusted;
  const pendingCount = admin ? await getPendingArticlesCount() : 0;

  return (
    <div className="articles-page">
      <header className="articles-header">
        <div>
          <p className="articles-eyebrow">Insights</p>
          <h1 className="articles-title">Articles</h1>
          <p className="articles-subtitle">Explore articles on Art & AI</p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          {canCreate && (
            <Link href="/articles/new" className="btn-primary create-article-link">
              {admin ? "Create Article" : "Submit Article"}
            </Link>
          )}

          {admin && (
            <Link href="/admin/review" className="btn-secondary create-article-link">
              Review Queue ({pendingCount})
            </Link>
          )}
        </div>
      </header>

      {/* Featured */}
      <section className="articles-featured">
        <div className="articles-featured-head">
          <h2 className="articles-featured-title">Featured</h2>
          <p className="articles-featured-subtitle">New + most discussed picks</p>
        </div>

        <div className="featured-grid">
          {featured.map((a: any) => (
            <Link key={a.id} href={`/articles/${a.id}`} className="featured-card">
              <div className={difficultyClass(a.difficulty)}>{a.difficulty}</div>

              <div className="featured-card-title">{a.title}</div>
              <div className="featured-card-body">{a.blurb}</div>

              <div className="featured-card-meta">
                <span>By {a.author}</span>
                <span>{a.comment_count} comment{a.comment_count === 1 ? "" : "s"}</span>
                <span className="featured-card-cta">Read →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* All articles */}
      <section className="articles-list">
        {articles.map((a: any) => (
          <article key={a.id} className="article-card">
            <div className="article-content">
              <div className="article-title-row">
                <h2 className="article-title">
                  <Link href={`/articles/${a.id}`}>{a.title}</Link>
                </h2>
                <span className={difficultyClass(a.difficulty)}>{a.difficulty}</span>
              </div>

              <div className="article-comments-muted" style={{ marginBottom: "0.6rem" }}>
                By <strong>{a.username}</strong>
                {" • "}
                {a.published_at ? new Date(a.published_at).toLocaleDateString() : "Unpublished"}
              </div>

              <p className="article-body">{a.blurb}</p>

              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span className="article-comments-muted">
                  {a.comment_count} comment{a.comment_count === 1 ? "" : "s"}
                </span>

                <Link className="article-link" href={`/articles/${a.id}`}>
                  Read full article
                </Link>

                <ReportButton contentType="article" contentId={a.id} authorId={a.author_id} authorUsername={a.username} />
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}