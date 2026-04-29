import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "../../../lib/auth";
import { getPublishedArticleById, isAdmin } from "../../../lib/db";
import ArticleCommentsSection from "../components/ArticleCommentsSection";
import ReportButton from "../../components/ReportButton";
import ArticleAdminActions from "../components/ArticleAdminActions";

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

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? verifyToken(token) : null;
  const admin = user ? await isAdmin(user.id) : false;

  return (
    <div style={{ padding: 40 }}>
      <h1>{article.title}</h1>

      {/* difficulty below title */}
      <div style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ color: "#64748b", fontWeight: 600 }}>By {article.author}</span>
        <span className={difficultyClass(article.difficulty)}>{article.difficulty}</span>
      </div>

      {article.published_at && (
        <p style={{ opacity: 0.7, marginTop: 10 }}>
          Published {new Date(article.published_at).toLocaleDateString()}
        </p>
      )}

      <div style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>{article.body}</div>

      <div style={{ marginTop: 12 }}>
        <ReportButton contentType="article" contentId={article.id} authorId={article.author_id} authorUsername={article.author} />
        {admin && <ArticleAdminActions articleId={article.id} />}
      </div>

      <div style={{ marginTop: 32 }}>
        <ArticleCommentsSection articleId={article.id} />
      </div>
    </div>
  );
}