"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface FeaturedArticle {
  id: number;
  title: string;
  blurb: string;
  difficulty: string;
  author: string;
  comment_count: number;
}

function difficultyClass(d: string) {
  if (d === "Beginner") return "difficulty-badge is-beginner";
  if (d === "Intermediate") return "difficulty-badge is-intermediate";
  return "difficulty-badge is-advanced";
}

export default function FeaturedArticles() {
  const [articles, setArticles] = useState<FeaturedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/featured-articles")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setArticles(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load featured articles.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="popular-section">
        <h2 className="popular-heading">FEATURED ARTICLES</h2>
        <div className="popular-loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="popular-section">
        <h2 className="popular-heading">FEATURED ARTICLES</h2>
        <div className="popular-error">{error}</div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="popular-section">
        <h2 className="popular-heading">FEATURED ARTICLES</h2>
        <div className="popular-empty">No articles published yet.</div>
      </div>
    );
  }

  return (
    <section className="popular-section">
      <h2 className="popular-heading">FEATURED ARTICLES</h2>
      <div className="popular-list">
        {articles.map((a) => (
          <Link href={`/articles/${a.id}`} key={a.id} className="popular-item">
            <div className="popular-item-header">
              <h3 className="popular-item-title">{a.title}</h3>
              <span className={difficultyClass(a.difficulty)}>{a.difficulty}</span>
            </div>
            <p className="popular-item-meta">
              by <span className="popular-item-author">{a.author}</span>
              {" · "}
              {a.comment_count} comment{a.comment_count === 1 ? "" : "s"}
            </p>
            <p className="popular-item-excerpt">
              {a.blurb && a.blurb.length > 120 ? a.blurb.substring(0, 120) + "…" : a.blurb}
            </p>
          </Link>
        ))}
      </div>
      <Link href="/articles" className="popular-view-all">
        View All Articles →
      </Link>
    </section>
  );
}
