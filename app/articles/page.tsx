import React from "react";
import { getArticles } from "../../lib/db";

export default async function ArticlesPage() {
    const articles = await getArticles();

    return (
        <div>
            <h1>Articles</h1>
            {articles.map((article) => (
                <div key={article.id} className="article-card">
                    <h2>{article.title}</h2>
                    <p>{article.body}</p>
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                        Read more
                    </a>
                </div>
            ))}
        </div>
    );
}
