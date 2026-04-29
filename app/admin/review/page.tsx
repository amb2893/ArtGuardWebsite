import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { verifyToken } from "../../../lib/auth";
import { getPendingArticles, isAdmin } from "../../../lib/db";
import { notFound } from "next/navigation";

function difficultyClass(d: string) {
  if (d === "Beginner") return "difficulty-badge is-beginner";
  if (d === "Intermediate") return "difficulty-badge is-intermediate";
  return "difficulty-badge is-advanced";
}

export default async function AdminReviewPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? verifyToken(token) : null;
  if (!user) return notFound();

  const admin = await isAdmin(user.id);
  if (!admin) return notFound();

  const items = await getPendingArticles();

  return (
    <div className="articles-page">
      <header className="articles-header">
        <div>
          <p className="articles-eyebrow">Admin</p>
          <h1 className="articles-title">Pending Review</h1>
          <p className="articles-subtitle">Articles submitted by trusted writers.</p>
        </div>
        <div style={{ alignSelf: "flex-start", display: "flex", gap: 16 }}>
          <Link href="/articles" className="article-link">← Articles</Link>
          <Link href="/admin" className="article-link">← Admin Hub</Link>
        </div>
      </header>

      <section className="articles-list">
        {items.length === 0 ? (
          <div className="article-card">
            <p className="article-body">There are no articles submitted for review.</p>
          </div>
        ) : (
          items.map((a: any) => (
            <article key={a.id} className="article-card">
              <div className="article-content">
                <div className="article-title-row">
                  <h2 className="article-title">
                    <Link href={`/admin/review/${a.id}`}>{a.title}</Link>
                  </h2>
                  <span className={difficultyClass(a.difficulty)}>{a.difficulty}</span>
                </div>

                <p className="article-body">{a.blurb}</p>

                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span className="article-comments-muted">By {a.username}</span>
                  <Link className="article-link" href={`/admin/review/${a.id}`}>
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