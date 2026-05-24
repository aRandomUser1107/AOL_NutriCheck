"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, USER_ID } from "@/lib/api";
import styles from "./log.module.css";

type FoodItem = {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
};

type FoodEntry = {
  id: number;
  food_id: number;
  category: string;
  quantity: number;
  updatedAt: string;
  food_item?: FoodItem | null;
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

export default function LogPage() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEntries() {
      try {
        const data = await apiFetch(`/api/logs/${USER_ID}/entries`);
        setEntries(Array.isArray(data) ? data : []);
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }

    loadEntries();
  }, []);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return entries;

    return entries.filter((entry) => {
      const foodName = entry.food_item?.name ?? "";
      return `${foodName} ${entry.category}`.toLowerCase().includes(normalizedQuery);
    });
  }, [entries, query]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className="label">Nutrition Log</p>
          <h1 className={styles.heading}>Log</h1>
          <p className={styles.subheading}>Review food entries from your daily nutrition log.</p>
        </div>

        <label className={styles.searchLabel}>
          <span>Search log</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search food or category"
            className={styles.searchInput}
          />
        </label>
      </header>

      <section className={`card ${styles.logCard}`}>
        <div className={styles.cardHead}>
          <h2>Food Entries</h2>
          <span>{entries.length} total</span>
        </div>

        {loading ? (
          <div className={styles.skeletonList}>
            {[1, 2, 3].map((item) => (
              <div key={item} className={styles.skeleton} />
            ))}
          </div>
        ) : filteredEntries.length > 0 ? (
          <div className={styles.entryList}>
            {filteredEntries.map((entry) => (
              <article key={entry.id} className={styles.entryItem}>
                <div>
                  <strong>{entry.food_item?.name ?? "Food item"}</strong>
                  <span>
                    {entry.category} • {formatDate(entry.updatedAt)}
                  </span>
                </div>

                <dl className={styles.nutrients}>
                  <div>
                    <dt>Qty</dt>
                    <dd>{entry.quantity}</dd>
                  </div>
                  <div>
                    <dt>Cal</dt>
                    <dd>{entry.food_item?.calories ?? "-"}</dd>
                  </div>
                  <div>
                    <dt>Protein</dt>
                    <dd>{entry.food_item ? `${entry.food_item.protein}g` : "-"}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h2>{entries.length > 0 ? "No matching entries" : "No log entries yet"}</h2>
            <p>{entries.length > 0 ? "Try another food name or category." : "Your food entries will show up here after they are added."}</p>
          </div>
        )}
      </section>
    </main>
  );
}
