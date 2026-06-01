"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, getRole, getNutritionistId } from "@/lib/api";
import styles from "./article.module.css";

type Article = {
  id: number;
  title: string;
  content: string;
  writer_id: number;
  postDate: string;
};

export default function ArticleDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const [article, setArticle]   = useState<Article | null>(null);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(false);

  const USER_ROLE       = getRole();
  const NUTRITIONIST_ID = getNutritionistId() ?? 0;
  const isOwn = USER_ROLE === "nutritionist" && article?.writer_id === NUTRITIONIST_ID;

  useEffect(() => {
    apiFetch(`/api/articles/${id}`)
      .then(setArticle)
      .catch(() => router.push("/articles"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/articles/${id}?nutritionist_id=${NUTRITIONIST_ID}`, { method: "DELETE" });
      router.push("/articles");
    } catch {
      setDeleting(false);
      alert("Failed to delete article.");
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
  }

  function renderContent(content: string) {
    return content.split("\n").filter(p => p.trim()).map((p, i) => (
      <p key={i} className={styles.paragraph}>{p}</p>
    ));
  }

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.skeletonWrap}>
        <div className={styles.skTitle} />
        <div className={styles.skMeta} />
        {[...Array(5)].map((_, i) => <div key={i} className={styles.skLine} />)}
      </div>
    </div>
  );

  if (!article) return null;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        <div className={styles.topBar}>
          <Link href="/articles" className="btn-ghost">← Back to Articles</Link>
          {isOwn && (
            <div className={styles.actions}>
              <Link href={`/articles/${id}/edit`} className={styles.editBtn}>Edit</Link>
              <button
                className={styles.deleteBtn}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          )}
        </div>

        <article className={styles.article}>
          <header className={styles.articleHeader}>
            <p className={styles.articleDate}>{formatDate(article.postDate)}</p>
            <h1 className={styles.articleTitle}>{article.title}</h1>
            <div className={styles.articleMeta}>
              <span className={styles.authorBadge}>
                Nutritionist #{article.writer_id}
              </span>
              {isOwn && (
                <span className={styles.ownBadge}>Your article</span>
              )}
            </div>
          </header>

          <div className={styles.articleBody}>
            {renderContent(article.content)}
          </div>
        </article>

        <div className={styles.bottomBar}>
          <Link href="/articles" className="btn-ghost">← All Articles</Link>
          {isOwn && (
            <Link href={`/articles/${id}/edit`} className="btn-primary">Edit Article</Link>
          )}
        </div>

      </div>
    </div>
  );
}