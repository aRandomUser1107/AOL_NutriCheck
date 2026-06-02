"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, getRole, getNutritionistId } from "@/lib/api";
import styles from "./editor.module.css";

export default function NewArticlePage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<"user" | "nutritionist" | null>(
    null,
  );
  const [nutritionistId, setNutritionistId] = useState<number>(0);

  useEffect(() => {
    setUserRole(getRole());
    setNutritionistId(getNutritionistId() ?? 0);
  }, []);

  if (userRole === null) {
    return (
      <div className={styles.page}>
        <div className={styles.forbidden}>
          <h2>Loading…</h2>
        </div>
      </div>
    );
  }

  if (userRole !== "nutritionist") {
    return (
      <div className={styles.page}>
        <div className={styles.forbidden}>
          <h2>Access Restricted</h2>
          <p>Only nutritionists can write articles.</p>
          <Link
            href="/articles"
            className="btn-primary"
            style={{ marginTop: 16 }}
          >
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  async function publish() {
    if (!title.trim()) {
      setError("Please add a title.");
      return;
    }
    if (!content.trim()) {
      setError("Please add some content.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const article = await apiFetch(
        `/api/articles/?nutritionist_id=${nutritionistId}`,
        {
          method: "POST",
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
          }),
        },
      );
      router.push(`/articles/${article.id}`);
    } catch (e: any) {
      setError(e.message || "Failed to publish.");
      setSaving(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Header */}
        <div className={styles.topBar}>
          <Link href="/articles" className="btn-ghost">
            ← Cancel
          </Link>
          <div className={styles.topActions}>
            <span className={styles.wordCount}>{wordCount} words</span>
            <button
              className={styles.publishBtn}
              onClick={publish}
              disabled={saving || !title.trim() || !content.trim()}
            >
              {saving ? (
                <>
                  <span className={styles.spinner} />
                  Publishing...
                </>
              ) : (
                "Publish Article"
              )}
            </button>
          </div>
        </div>

        <div className={`card ${styles.editorCard}`}>
          <div className={styles.editorHeader}>
            <span className={styles.authorTag}>
              Writing as Nutritionist{nutritionistId}
            </span>
          </div>

          <input
            className={styles.titleInput}
            type="text"
            placeholder="Article title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />

          <div className={styles.divider} />

          <textarea
            className={styles.contentInput}
            placeholder={`Start writing your article here…\n\nShare nutrition tips, healthy recipes, wellness advice, or research insights. Use blank lines to separate paragraphs.`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className={styles.editorFooter}>
            <span className={styles.charCount}>{charCount} characters</span>
            <span className={styles.readTime}>
              ~{Math.max(1, Math.ceil(wordCount / 200))} min read
            </span>
          </div>
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={`card ${styles.tipsCard}`}>
          <p className={styles.tipsTitle}>Writing tips</p>
          <ul className={styles.tipsList}>
            <li>Keep paragraphs short — 3 to 5 sentences each</li>
            <li>Use blank lines to separate paragraphs</li>
            <li>Start with the most important insight</li>
            <li>Back claims with evidence or examples</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
