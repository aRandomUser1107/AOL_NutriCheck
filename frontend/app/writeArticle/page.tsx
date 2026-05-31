// writeArticle.tsx — Write Article Page
// Route: /write-article
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "../articles/article.css";

const CATEGORIES = ["Nutrition", "Recipes", "Gut Health", "Superfoods", "Meal Prep"];


export default function WriteArticle() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("")

  return (
    <>
      <div className="accent-bar" />
      <div className="navbar-spacer" />

      <div className="write-page">
        {/* Back button */}
        <button className="write-page-back" onClick={() => router.back()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Articles
        </button>

        {/* Heading */}
        <h1 className="write-page-heading">Write Your Article</h1>
        <p className="write-page-sub">
          Share your knowledge with our community. Our team will review your submission
          to ensure accuracy before it goes live.
        </p>

        {/* Form */}
        <div className="write-form-field">
          <label className="write-form-label">Article Title</label>
          <input
            className="write-form-input"
            type="text"
            placeholder="Enter a clear and descriptive title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="write-form-field">
          <label className="write-form-label">Category</label>
          <select className="write-form-select write-form-input">
            <option value="">Select a category…</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="write-form-field">
          <label className="write-form-label">Your Name</label>
          <input
            className="write-form-input"
            type="text"
            placeholder="e.g. Dr. Jane Smith"
          />
        </div>

        <div className="write-form-field">
          <label className="write-form-label">Short Summary</label>
          <input
            className="write-form-input"
            type="text"
            placeholder="One or two sentences describing your article"
          />
        </div>

        <div className="write-form-field">
          <label className="write-form-label">Article Body</label>
          <textarea
            className="write-form-textarea"
            placeholder="Write your full article here…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="write-form-field">
          <label className="write-form-label">Cover Image URL (optional)</label>
          <input
            className="write-form-input"
            type="url"
            placeholder="https://example.com/your-image.jpg"
          />
        </div>

        <div className="write-submit-row">
          <button className="btn-submit" onClick={handleSubmit}>Submit for Review</button>
          <button className="btn-cancel" onClick={() => router.back()}>Cancel</button>
        </div>
      </div>
    </>
  );
}
