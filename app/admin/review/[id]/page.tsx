import React from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { verifyToken } from "../../../../lib/auth";
import { getPendingArticleById, isAdmin } from "../../../../lib/db";

function difficultyClass(d: string) {
  if (d === "Beginner") return "difficulty-badge is-beginner";
  if (d === "Intermediate") return "difficulty-badge is-intermediate";
  return "difficulty-badge is-advanced";
}

export default async function AdminReviewDetailPage({
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

  const article = await getPendingArticleById(id);
  if (!article) return notFound();

  return (
    <div style={{ padding: 40, maxWidth: 1000, margin: "0 auto" }}>
      <h1>{article.title}</h1>

      <div style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "center" }}>
        <span className={difficultyClass(article.difficulty)}>{article.difficulty}</span>
        <span style={{ color: "#64748b", fontWeight: 600 }}>By {article.username}</span>
      </div>

      <p style={{ marginTop: 14, color: "#4a5875" }}>{article.blurb}</p>

      <div style={{ whiteSpace: "pre-wrap", marginTop: 18 }}>{article.body}</div>

      <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
        <form action={`/api/admin/articles/${article.id}/approve`} method="post">
          <button type="submit">Approve & Publish</button>
        </form>

        <form action={`/api/admin/articles/${article.id}/deny`} method="post">
          <button type="submit">Deny & Delete</button>
        </form>
      </div>
    </div>
  );
}