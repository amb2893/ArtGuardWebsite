import React from "react";
import { notFound } from "next/navigation";
import { getPublishedArticleById } from "../../../lib/db";
import ArticleCommentsSection from "../components/ArticleCommentsSection";

function difficultyClass(d: string) {
  if (d === "Beginner") return "difficulty-badge is-beginner";
  if (d === "Intermediate") return "difficulty-badge is-intermediate";
  return "difficulty-badge is-advanced";
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (Number.isNaN(id)) return notFound();

  const article = await getPublishedArticleById(id);
  if (!article) return notFound();

  return (
    <div style={{ padding: 40 }}>
      <h1>{article.title}</h1>

      {/* difficulty below title */}
      <div style={{ marginTop: 10 }}>
        <span className={difficultyClass(article.difficulty)}>{article.difficulty}</span>
      </div>

      {article.published_at && (
        <p style={{ opacity: 0.7, marginTop: 10 }}>
          Published {new Date(article.published_at).toLocaleDateString()}
        </p>
      )}

      <div style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>{article.body}</div>

      <div style={{ marginTop: 32 }}>
        <ArticleCommentsSection articleId={article.id} />
      </div>
    </div>
  );
}