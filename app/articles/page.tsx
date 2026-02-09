import React from "react";
import { getArticles } from "../../lib/db";
import ArticleCommentsSection from "./components/ArticleCommentsSection";

export default async function ArticlesPage() {
    const articles = await getArticles();

    return (
        <div className="articles-page">
            <header className="articles-header">
                <div>
                    <p className="articles-eyebrow">Insights</p>
                    <h1 className="articles-title">Articles</h1>
                    <p className="articles-subtitle">Explore articles on Art & AI</p>
                </div>
            </header>

            <section className="articles-list">
                {articles.map((article) => (
                    <article key={article.id} className="article-card">
                        <div className="article-content">
                            <h2 className="article-title">{article.title}</h2>
                            <p className="article-body">{article.body}</p>
                            <a className="article-link" href={article.url} target="_blank" rel="noopener noreferrer">
                                Read more
                            </a>
                        </div>
                        <ArticleCommentsSection articleId={article.id} />
                    </article>
                ))}
            </section>
        </div>
    );
}
