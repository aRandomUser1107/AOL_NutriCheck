"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import "../articles/article.css";

interface Article {
  id: number;
  writer_id: number;
  title: string;
  content: string;
  postDate: string | Date;
}

function formatDate(value?: string | Date) {
  if (!value) return "";

  const date = typeof value === "string" ? new Date(value) : value;

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ArticlePage() {
  const router = useRouter();
  const params = useParams();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticle() {
      try {
        const data = await apiFetch(
          `/api/articles/${params.id}`
        );

        setArticle(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [params.id]);

  if (loading){
    return <div>Loading article...</div>
  }

  return (
    <>
      <div className="accent-bar" />
      <div className="navbar-spacer" />

      <div className="article-page">
        {/* Back button */}
        <button className="article-page-back" onClick={() => router.back()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Articles
        </button>

        {/* Tag */}
        {/*<span className="article-page-tag">Superfoods</span>*/}

        {/* Title */}
        <h1 className="article-page-title">
          {article?.title}
        </h1>

        {/* Meta */}
        <div className="article-page-meta">
          <span className="author">
            Nutritionist #{article?.writer_id}
          </span>
        </div>
        <div className="article-page-meta">
          <span className="dot">
            {formatDate(article?.postDate)}
          </span>
        </div>
        <div className="article-page-body">
          <p>{article?.content}</p>
        </div>
      </div>
    </>
  );
}
