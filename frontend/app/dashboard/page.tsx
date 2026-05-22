"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch, USER_ID } from "@/lib/api";
import styles from "./dashboard.module.css";

type Summary = {
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  entries_count: number;
};

type Profile = {
  age: number;
  height: number;
  weight: number;
};

type Article = {
  id: number;
  title: string;
  postDate: string;
};

type Bmi = {
  bmi: number;
  category: string;
};

const CALORIE_GOAL = 2000;

function hasLoggedFood(summary: Summary | null): summary is Summary {
  return Boolean(summary && summary.entries_count > 0);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bmi, setBmi] = useState<Bmi | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [summaryData, profileData, articlesData] = await Promise.allSettled([
          apiFetch(`/api/logs/${USER_ID}/summary`),
          apiFetch(`/api/users/${USER_ID}/profile`),
          apiFetch("/api/articles/"),
        ]);

        if (summaryData.status === "fulfilled") {
          setSummary(summaryData.value.summary);
        }

        if (profileData.status === "fulfilled") {
          setProfile(profileData.value);
          const bmiData = await apiFetch(`/api/users/${USER_ID}/bmi`).catch(() => null);
          if (bmiData) setBmi(bmiData);
        }

        if (articlesData.status === "fulfilled") {
          setArticles(articlesData.value.slice(0, 3));
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const today = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  }, []);

  const hasSummary = hasLoggedFood(summary);
  const activeSummary = hasSummary ? summary : null;
  const calPercent = activeSummary ? Math.min((activeSummary.calories / CALORIE_GOAL) * 100, 100) : 0;
  const remainingCalories = activeSummary ? Math.max(CALORIE_GOAL - activeSummary.calories, 0) : null;

  const macros = activeSummary
    ? [
        { label: "Protein", value: activeSummary.protein, unit: "g", color: "var(--teal)", max: 150 },
        { label: "Carbs", value: activeSummary.carbohydrates, unit: "g", color: "var(--sage)", max: 250 },
        { label: "Fats", value: activeSummary.fats, unit: "g", color: "#f2a766", max: 65 },
      ]
    : [];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className="label">Today, {today}</p>
          <h1 className={styles.heading}>Good {greeting}</h1>
          <p className={styles.subheading}>Here&apos;s your nutrition overview for today.</p>
        </div>

        <Link href="/log" className={`btn-ghost ${styles.headerAction}`}>
          View log
        </Link>
      </header>

      {loading ? (
        <section className={styles.skeletonGrid} aria-label="Loading dashboard">
          {[...Array(4)].map((_, index) => (
            <div key={index} className={styles.skeleton} />
          ))}
        </section>
      ) : (
        <>
          <section className={styles.statsGrid} aria-label="Daily nutrition summary">
            <article className={`card ${styles.calorieCard}`}>
              <p className="label">Calories today</p>
              <div className={styles.calorieRow}>
                <span className={styles.bigNum}>{activeSummary ? activeSummary.calories : "-"}</span>
                <span className={styles.calorieGoal}>{activeSummary ? `/ ${CALORIE_GOAL} kcal` : "kcal"}</span>
              </div>
              {activeSummary ? (
                <>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${calPercent}%`,
                        background: calPercent > 90 ? "#f87171" : "var(--blue)",
                      }}
                    />
                  </div>
                  <p className={styles.progressLabel}>{remainingCalories} kcal remaining</p>
                </>
              ) : (
                <p className={styles.progressLabel}>No calorie data yet.</p>
              )}
            </article>

            <article className={`card ${styles.statCard}`}>
              <p className="label">Meals logged</p>
              <span className={styles.bigNum}>{activeSummary ? activeSummary.entries_count : "-"}</span>
              <p className={styles.statSub}>{activeSummary ? "entries today" : "No entries yet"}</p>
              <Link href="/log" className={`btn-ghost ${styles.cardLink}`}>
                View log
              </Link>
            </article>

            <article className={`card ${styles.statCard}`}>
              <p className="label">BMI</p>
              {bmi ? (
                <>
                  <span className={styles.bigNum}>{bmi.bmi}</span>
                  <span className={`${styles.bmiBadge} ${styles[bmi.category.toLowerCase().replace(" ", "")]}`}>
                    {bmi.category}
                  </span>
                </>
              ) : (
                <>
                  <span className={styles.bigNum}>-</span>
                  <Link href="/profile" className={`btn-ghost ${styles.cardLink}`}>
                    Set up profile
                  </Link>
                </>
              )}
            </article>
          </section>

          <section className={styles.bottomGrid}>
            <article className={`card ${styles.macroCard}`}>
              <h2 className={styles.cardTitle}>Macro Breakdown</h2>
              {activeSummary ? (
                <div className={styles.macroList}>
                  {macros.map((macro) => (
                    <div key={macro.label} className={styles.macroRow}>
                      <div className={styles.macroMeta}>
                        <span className={styles.macroLabel}>{macro.label}</span>
                        <span className={styles.macroVal}>
                          {macro.value}
                          {macro.unit}
                        </span>
                      </div>
                      <div className={styles.macroTrack}>
                        <div
                          className={styles.macroFill}
                          style={{
                            width: `${Math.min((macro.value / macro.max) * 100, 100)}%`,
                            background: macro.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.empty}>
                  <p>No food logged yet today.</p>
                  <Link href="/log" className={`btn-ghost ${styles.emptyAction}`}>
                    Open log
                  </Link>
                </div>
              )}
            </article>

            <article className={`card ${styles.articlesCard}`}>
              <div className={styles.cardTitleRow}>
                <h2 className={styles.cardTitle}>Latest Articles</h2>
                <Link href="/articles" className={styles.seeAll}>
                  See all
                </Link>
              </div>
              {articles.length > 0 ? (
                <ul className={styles.articleList}>
                  {articles.map((article) => (
                    <li key={article.id} className={styles.articleItem}>
                      <Link href="/articles" className={styles.articleTitle}>
                        {article.title}
                      </Link>
                      <span className={styles.articleDate}>{formatDate(article.postDate)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.emptyText}>No articles yet.</p>
              )}
            </article>
          </section>

          <section className={`card ${styles.profileStrip}`} aria-label="Profile summary">
            <div>
              <p className="label">Health profile</p>
              <h2 className={styles.cardTitle}>Personal metrics</h2>
            </div>

            {profile ? (
              <div className={styles.profileStats}>
                <span>{profile.age} yrs</span>
                <span>{profile.height} cm</span>
                <span>{profile.weight} kg</span>
              </div>
            ) : (
              <Link href="/profile" className={`btn-ghost ${styles.cardLink}`}>
                Complete profile
              </Link>
            )}
          </section>
        </>
      )}
    </main>
  );
}
