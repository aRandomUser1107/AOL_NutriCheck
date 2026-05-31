// ArticlePage.tsx — Article Detail Page
// Route: /article
// To use a local image: replace IMAGE_FILENAME below with your actual file name
//   e.g.  const IMAGE_FILENAME = "my-article-photo.jpg";
// Then place the image file inside your /public folder (or wherever your bundler serves static assets).
"use client";

import { useRouter } from "next/navigation";
import "../articles/article.css";

// ── ⬇⬇ REPLACE THIS WITH YOUR IMAGE FILE NAME ⬇⬇ ───────────
const IMAGE_FILENAME = "articlePage-picture.jpg"; // e.g. "article-cover.jpg"
// ─────────────────────────────────────────────────────────────

const LOREM_PARAGRAPHS = [
  `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia,
  nisl nisl aliquam nisl, nec aliquam nisl nisl sit amet nisl. Pellentesque habitant morbi tristique
  senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae,
  ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper.`,

  `Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien
  ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi.
  Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus
  enim ac dui. Donec non enim in turpis pulvinar facilisis.`,

  `Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo
  sit amet risus. Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac
  facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
  Praesent commodo cursus magna, vel scelerisque nisl consectetur et.`,

  `Nullam quis risus eget urna mollis ornare vel eu leo. Cum sociis natoque penatibus et magnis dis
  parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula ut id elit.
  Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cras mattis consectetur purus
  sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam.`,

  `Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id
  ligula porta felis euismod semper. Fusce dapibus, tellus ac cursus commodo, tortor mauris
  condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis
  euismod. Donec sed odio dui.`,
];

export default function ArticlePage() {
  const router = useRouter()

  const imageUrl = IMAGE_FILENAME
    ? `/${IMAGE_FILENAME}`
    : null;

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
        <h1 className="article-page-title">The Quiet Power of Fermented Foods: Science, Gut Microbiome, and You</h1>

        {/* Meta */}
        <div className="article-page-meta">
          <span className="author">Dr. Mei Sato</span>
          <span className="dot" />
          <span>11 mins read</span>
          <span className="dot" />
          <span>May 14, 2026</span>
        </div>

        {/* Image — place your file name in IMAGE_FILENAME at the top of this file */}
        {imageUrl ? (
          <img
            className="article-page-img"
            src={imageUrl}
            alt="Article cover"
          />
        ) : (
          <div className="article-img-placeholder">
            <div>
              <p style={{ fontSize: 14, marginBottom: 6 }}>📷 Article Image</p>
              <p style={{ fontSize: 12 }}>
                Set <code style={{ background: "#E4EDEA", padding: "1px 5px", borderRadius: 3 }}>IMAGE_FILENAME</code>
                {" "}at the top of <strong>ArticlePage.tsx</strong>
              </p>
            </div>
          </div>
        )}

        {/* Body text */}
        <div className="article-page-body">
          <h2>Introduction</h2>
          {LOREM_PARAGRAPHS.slice(0, 2).map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          <h2>What the Research Says</h2>
          {LOREM_PARAGRAPHS.slice(2, 4).map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          <h2>Key Takeaways</h2>
          {LOREM_PARAGRAPHS.slice(4).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </>
  );
}
