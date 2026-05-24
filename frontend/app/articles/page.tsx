"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import styles from "./articles.module.css";

type Article = {
  id: number;
  writer_id: number;
  title: string;
  content: string;
  postDate: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticles() {
      try {
        const data = await apiFetch("/api/articles/");
        setArticles(Array.isArray(data) ? data : []);
      } catch {
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }

    loadArticles();
  }, []);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className="label">Nutritionist Articles</p>
        <h1 className={styles.heading}>Articles</h1>
        <p className={styles.subheading}>Browse nutrition guidance and healthy eating updates from NutriCheck.</p>
      </header>

      <section className={`card ${styles.articleCard}`}>
        <div className={styles.cardHead}>
          <h2>All Articles</h2>
          <span>{articles.length} total</span>
        </div>

        {loading ? (
          <div className={styles.skeletonList}>
            {[1, 2, 3].map((item) => (
              <div key={item} className={styles.skeleton} />
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className={styles.articleList}>
            {articles.map((article) => (
              <article key={article.id} className={styles.articleItem}>
                <div className={styles.articleMeta}>
                  <span>{formatDate(article.postDate)}</span>
                  <span>Nutritionist #{article.writer_id}</span>
                </div>
                <h2>{article.title}</h2>
                <p>{article.content}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h2>No articles yet</h2>
            <p>Published nutritionist articles will show up here.</p>
          </div>
        )}
      </section>
    </main>
  );
}
