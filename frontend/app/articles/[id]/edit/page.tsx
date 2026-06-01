"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, getRole, getNutritionistId } from "@/lib/api";
import styles from "../../new/editor.module.css";

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle]       = useState("");
  const [content, setContent]   = useState("");
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [forbidden, setForbidden] = useState(false);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  const USER_ROLE       = getRole();
  const NUTRITIONIST_ID = getNutritionistId() ?? 0;

  useEffect(() => {
    apiFetch(`/api/articles/${id}`)
      .then(data => {
        if (USER_ROLE !== "nutritionist" || data.writer_id !== NUTRITIONIST_ID) {
          setForbidden(true); return;
        }
        setTitle(data.title);
        setContent(data.content);
      })
      .catch(() => router.push("/articles"))
      .finally(() => setLoading(false));
  }, [id]);

  async function saveChanges() {
    if (!title.trim())   { setError("Please add a title."); return; }
    if (!content.trim()) { setError("Please add some content."); return; }
    setSaving(true); setError("");
    try {
      await apiFetch(`/api/articles/${id}?nutritionist_id=${NUTRITIONIST_ID}`, {
        method: "PUT",
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });
      router.push(`/articles/${id}`);
    } catch (e: any) {
      setError(e.message || "Failed to save changes.");
      setSaving(false);
    }
  }

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div style={{ height: 48, background: "var(--stone-100)", borderRadius: 8, marginBottom: 16 }} />
        <div style={{ height: 400, background: "var(--stone-100)", borderRadius: 18 }} />
      </div>
    </div>
  );

  if (forbidden) return (
    <div className={styles.page}>
      <div className={styles.forbidden}>
        <h2>Access Restricted</h2>
        <p>You can only edit your own articles.</p>
        <Link href="/articles" className="btn-primary" style={{ marginTop: 16 }}>
          Back to Articles
        </Link>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        <div className={styles.topBar}>
          <Link href={`/articles/${id}`} className="btn-ghost">← Cancel</Link>
          <div className={styles.topActions}>
            <span className={styles.wordCount}>{wordCount} words</span>
            <button
              className={styles.publishBtn}
              onClick={saveChanges}
              disabled={saving || !title.trim() || !content.trim()}
            >
              {saving ? <><span className={styles.spinner} />Saving…</> : "Save Changes"}
            </button>
          </div>
        </div>

        <div className={`card ${styles.editorCard}`}>
          <div className={styles.editorHeader}>
            <span className={styles.authorTag}>Editing article...{id}</span>
          </div>

          <input
            className={styles.titleInput}
            type="text"
            placeholder="Article title…"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={200}
          />

          <div className={styles.divider} />

          <textarea
            className={styles.contentInput}
            placeholder="Start writing…"
            value={content}
            onChange={e => setContent(e.target.value)}
          />

          <div className={styles.editorFooter}>
            <span className={styles.charCount}>{charCount} characters</span>
            <span className={styles.readTime}>~{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
          </div>
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

      </div>
    </div>
  );
}