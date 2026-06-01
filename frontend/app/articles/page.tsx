"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, getRole, getNutritionistId } from "@/lib/api";
import styles from "./articles.module.css";
import { FiSearch } from "react-icons/fi";

type Article = {
  id: number;
  title: string;
  content: string;
  writer_id: number;
  postDate: string;
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Title A–Z" },
];

export default function ArticlesPage() {
  const USER_ROLE       = getRole();
  const NUTRITIONIST_ID = getNutritionistId() ?? 0;
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const isNutritionist = USER_ROLE === "nutritionist";

  useEffect(() => {
    loadArticles();
  }, []);

  async function loadArticles() {
    setLoading(true);
    try {
      const data = await apiFetch("/api/articles/");
      setArticles(data);
    } finally {
      setLoading(false);
    }
  }

  async function deleteArticle(id: number) {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await apiFetch(`/api/articles/${id}?nutritionist_id=${NUTRITIONIST_ID}`, {
        method: "DELETE",
      });
      setArticles((prev) => prev.filter((a) => a.id !== id));
      showToast("Article deleted.");
    } catch (e: any) {
      showToast(e.message || "Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const filtered = articles
    .filter((a) => a.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sort === "newest")
        return new Date(b.postDate).getTime() - new Date(a.postDate).getTime();
      if (sort === "oldest")
        return new Date(a.postDate).getTime() - new Date(b.postDate).getTime();
      if (sort === "title") return a.title.localeCompare(b.title);
      return 0;
    });

  const myArticles = filtered.filter((a) => a.writer_id === NUTRITIONIST_ID);
  const otherArticles = filtered.filter((a) => a.writer_id !== NUTRITIONIST_ID);

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function excerpt(content: string, len = 120) {
    return content.length > len
      ? content.slice(0, len).trimEnd() + "…"
      : content;
  }

  return (
    <div className={styles.page}>
      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.header}>
        <div>
          <p className="label">Knowledge Hub</p>
          <h1 className={styles.heading}>Articles</h1>
          <p className={styles.sub}>
            {isNutritionist
              ? "Manage your articles and share nutrition knowledge."
              : "Expert nutrition articles written by our nutritionists."}
          </p>
        </div>
        {isNutritionist && (
          <Link href="/articles/new" className="btn-primary">
            + Write Article
          </Link>
        )}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <FiSearch className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search articles…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => setQuery("")}>
              X
            </button>
          )}
        </div>
        <select
          className={styles.sortSelect}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className={styles.skeletonGrid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>{query ? `No articles match "${query}"` : "No articles yet."}</p>
          {isNutritionist && !query && (
            <Link
              href="/articles/new"
              className="btn-primary"
              style={{ marginTop: 16 }}
            >
              Write the first article
            </Link>
          )}
        </div>
      ) : (
        <>
          {isNutritionist && myArticles.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionDot} />
                My Articles
                <span className={styles.sectionCount}>{myArticles.length}</span>
              </h2>
              <div className={styles.articleGrid}>
                {myArticles.map((a) => (
                  <ArticleCard
                    key={a.id}
                    article={a}
                    isOwn={true}
                    isNutritionist={true}
                    onDelete={deleteArticle}
                    deletingId={deletingId}
                    formatDate={formatDate}
                    excerpt={excerpt}
                  />
                ))}
              </div>
            </section>
          )}

          <section className={styles.section}>
            {isNutritionist && myArticles.length > 0 && (
              <h2 className={styles.sectionTitle}>
                <span
                  className={styles.sectionDot}
                  style={{ background: "var(--muted-teal)" }}
                />
                All Articles
                <span className={styles.sectionCount}>
                  {otherArticles.length}
                </span>
              </h2>
            )}
            <div className={styles.articleGrid}>
              {(isNutritionist && myArticles.length > 0
                ? otherArticles
                : filtered
              ).map((a) => (
                <ArticleCard
                  key={a.id}
                  article={a}
                  isOwn={a.writer_id === NUTRITIONIST_ID}
                  isNutritionist={isNutritionist}
                  onDelete={deleteArticle}
                  deletingId={deletingId}
                  formatDate={formatDate}
                  excerpt={excerpt}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function ArticleCard({
  article,
  isOwn,
  isNutritionist,
  onDelete,
  deletingId,
  formatDate,
  excerpt,
}: {
  article: Article;
  isOwn: boolean;
  isNutritionist: boolean;
  onDelete: (id: number) => void;
  deletingId: number | null;
  formatDate: (d: string) => string;
  excerpt: (c: string, len?: number) => string;
}) {
  return (
    <div
      className={`card ${styles.articleCard} ${isOwn ? styles.ownCard : ""}`}
    >
      {isOwn && <span className={styles.ownBadge}>My article</span>}
      <div className={styles.cardBody}>
        <p className={styles.cardDate}>{formatDate(article.postDate)}</p>
        <Link href={`/articles/${article.id}`} className={styles.cardTitle}>
          {article.title}
        </Link>
        <p className={styles.cardExcerpt}>{excerpt(article.content)}</p>
      </div>
      <div className={styles.cardFooter}>
        <Link href={`/articles/${article.id}`} className={styles.readMore}>
          Read article →
        </Link>
        {isNutritionist && isOwn && (
          <div className={styles.cardActions}>
            <Link
              href={`/articles/${article.id}/edit`}
              className={styles.editBtn}
            >
              Edit
            </Link>
            <button
              className={styles.deleteBtn}
              onClick={() => onDelete(article.id)}
              disabled={deletingId === article.id}
            >
              {deletingId === article.id ? "…" : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
