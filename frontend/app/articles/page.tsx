// NutriCheck.tsx — Articles Listing Page
// Requires react-router-dom: npm install react-router-dom
// Usage: wrap your app root with <BrowserRouter> and add <Route path="/" element={<NutriCheck />} />
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./article.css";

// ── Types ──────────────────────────────────────────────────────
interface Article {
  id: number;
  tag: string;
  tagClass: string;
  title: string;
  excerpt: string;
  author: string;
  readTime: string;
  img: string;
}

// ── Data ───────────────────────────────────────────────────────
const CATEGORIES = ["ALL", "MEAL PREP", "GUT HEALTH", "RECIPE", "NUTRITION", "SUPERFOODS"];

const ARTICLES: Article[] = [
  {
    id: 1,
    tag: "RECIPE",
    tagClass: "recipe",
    title: "Sick of eating the same things? 5 ways to boost your nutrition and keep meals interesting and healthy",
    excerpt: "Small dietary changes can make a big difference to how you feel, how your body functions and health indicators such as blood pressure.",
    author: "Clare Collins",
    readTime: "5 mins read",
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&q=80",
  },
  {
    id: 2,
    tag: "RECIPE",
    tagClass: "recipe",
    title: "5 High-Protein Breakfast Ready in Under 10 minutes",
    excerpt: "Skip the sad cereal bowl. This morning meals front-load your day with sustained energy and real flavour.",
    author: "Carlos Mendez",
    readTime: "5 mins read",
    img: "https://images.unsplash.com/photo-1484723091739-30990bf5e65f?w=700&q=80",
  },
  {
    id: 3,
    tag: "NUTRITION",
    tagClass: "nutrition",
    title: "Omega-3 vs Omega-6: Why the Ratio Matters More Than You Think",
    excerpt: "Modern diet has tips this ancient balance. Here's how to recalibrate without overhauling everything you eat.",
    author: "Lena Okafor",
    readTime: "7 mins read",
    img: "https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=700&q=80",
  },
  {
    id: 4,
    tag: "GUT HEALTH",
    tagClass: "gut-health",
    title: "Your gut lining is talking, are you listening?",
    excerpt: "Leaky gut is more than a wellness buzzword. New evidence links intestinal permeability to inflammation and metabolic syndrome.",
    author: "Dr. Aisha Patel",
    readTime: "9 mins read",
    img: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=700&q=80",
  },
  {
    id: 5,
    tag: "SUPERFOODS",
    tagClass: "superfoods",
    title: "Adaptogens Demystified: Which Ones Actually Work",
    excerpt: "Ashwagandha, lion's mane, reishi — the supplement aisle is crowded with promises. We asked the research what it actually says.",
    author: "Dr. Mei Sato",
    readTime: "8 mins read",
    img: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=700&q=80",
  },
  {
    id: 6,
    tag: "MEAL PREP",
    tagClass: "meal-prep",
    title: "The Two-Hour Sunday Ritual That Changes Your Entire Week",
    excerpt: "Strategic batch cooking isn't about deprivation — it's about removing the 6 PM decision fatigue that derails even the best intentions.",
    author: "Sam Nguyen",
    readTime: "6 mins read",
    img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=700&q=80",
  },
];

// ── Helpers ────────────────────────────────────────────────────
function normalize(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-");
}

function categoryMatchesTag(cat: string, tag: string): boolean {
  return normalize(cat) === normalize(tag);
}

// ── Main Component ─────────────────────────────────────────────
export default function NutriCheck() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("ALL");

  const filtered =
    activeCategory === "ALL"
      ? ARTICLES
      : ARTICLES.filter((a) => categoryMatchesTag(a.tag, activeCategory));

  return (
    <>
      {/* Accent bar at very top */}
      <div className="accent-bar" />

      {/* Reserved space for external navbar */}
      <div className="navbar-spacer" />

      {/* ── Featured Article ── */}
      <section className="featured-section">
        <div className="page-wrap">
          <span className="featured-tag">Superfoods</span>
          <h1 className="featured-title">
            The Quiet Power of Fermented Foods: Science, Gut Microbiome, and You
          </h1>
          <p className="featured-excerpt">
            A growing body of research reveals how living cultures in everyday foods can reshape immunity, mood,
            and metabolic health. One spoonful at a time.
          </p>
          <div className="featured-row">
            <button
              className="btn-read-more"
              onClick={() => router.push("/articlePage")}
            >
              Read more
            </button>
            <div className="featured-meta">
              <span className="author">Dr. Mei Sato</span>
              <span className="dot" />
              <span>5 mins read</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section heading ── */}
      <div className="page-wrap">
        <div className="articles-heading">
          <p className="label">Latest Article</p>
          <h2 className="big-title">
            Eat Smart, <em>Live Well</em>
          </h2>
        </div>

        {/* ── Sidebar + Grid layout ── */}
        <div className="articles-layout">
          {/* Category sidebar */}
          <nav className="category-sidebar">
            <ul>
              {CATEGORIES.map((cat) => (
                <li
                  key={cat}
                  className={activeCategory === cat ? "active" : ""}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </nav>

          {/* Article cards */}
          <div className="articles-grid">
            {filtered.map((art) => (
              <article
                key={art.id}
                className="article-card"
                onClick={() => router.push("/article")}
              >
                <div className="card-img-wrap">
                  <img
                    className="card-img"
                    src={art.img}
                    alt={art.title}
                    loading="lazy"
                  />
                  <span className={`card-label ${art.tagClass}`}>{art.tag}</span>
                </div>
                <div className="card-body">
                  <h3 className="card-title">{art.title}</h3>
                  <p className="card-excerpt">{art.excerpt}</p>
                  <div className="card-footer">
                    <span className="card-author">{art.author}</span>
                    <span className="dot" style={{ width: 3, height: 3, borderRadius: "50%", background: "#E4EDEA", display: "inline-block" }} />
                    <span>{art.readTime}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sharing / CTA section ── */}
      <section className="sharing-section">
        <div className="sharing-inner">
          <h2 className="sharing-title">
            Sharing is <em>Caring</em>
          </h2>
          <p className="sharing-subtitle">
            Share with us your knowledge and let's learn together!
          </p>
          <p className="sharing-body">
            Are you a nutritionist? Do you like making healthy snacks? Got any idea on meal-prep for busy
            worker or student?<br />
            We'll more than happy to know your magic!{" "}
            <em>HEALTHY FOOD, HAPPY LIFE</em>
          </p>
          <button
            className="btn-write"
            onClick={() => router.push("/writeArticle")}
          >
            Write Your Article
          </button>
          <p className="sharing-disclaimer">
            *We'll make sure to verify your content to prevent misinformation
          </p>
        </div>
      </section>
    </>
  );
}
