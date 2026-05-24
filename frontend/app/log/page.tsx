"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, USER_ID } from "@/lib/api";
import styles from "./log.module.css";
import { GiShinyApple } from "react-icons/gi";
import { MdFreeBreakfast } from "react-icons/md";
import { FaCloudSun } from "react-icons/fa";
import { IoIosCloudyNight } from "react-icons/io";

/*
  properties and methods for the log page:
  - FoodItem: includes food nutrition information
  - FoodEntry: the identity of the food (id, category, quantity) and is linked to FoodItem
  - NutritionLog: food entries from specific dates
  - Summary: summary of food nutrition for the day
  - LogPage: main component that displays the log and summary. Also handles loading state and calculation
*/

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
  food_item: FoodItem;
};

type NutritionLog = {
  id: number;
  logDate: string;
  totalNutrition: number;
  entries: FoodEntry[];
};

type Summary = {
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  entries_count: number;
};

const MEAL_CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Snack"];

const MEAL_ICONS: Record<string, React.ReactNode> = {
  Breakfast: <MdFreeBreakfast />,
  Lunch: <FaCloudSun />,
  Dinner: <IoIosCloudyNight />,
  Snack: <GiShinyApple />,
};

const CALORIE_GOAL = 2000; //temp

export default function LogPage() {
  const [log, setLog]         = useState<NutritionLog | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => { loadLog(); }, []);

  // api not connected yet
  async function loadLog() {
    setLoading(true);
    try {
      const [logData, summaryData] = await Promise.all([
        apiFetch(`/api/logs/${USER_ID}/today`),
        apiFetch(`/api/logs/${USER_ID}/summary`),
      ]);
      setLog(logData);
      setSummary(summaryData.summary);
    } catch (e) {
      console.error("Failed to load log:", e);
    } finally {
      setLoading(false);
    }
  }

  async function deleteEntry(entryId: number, calories: number, quantity: number) {
    setDeletingId(entryId);
    try {
      await apiFetch(`/api/logs/entries/${entryId}`, { method: "DELETE" }); //api not connected yet

      setLog(prev => prev ? {
        ...prev,
        entries: prev.entries.filter(e => e.id !== entryId),
        totalNutrition: Math.max(0, prev.totalNutrition - calories * quantity),
      } : null);
      setSummary(prev => prev ? {
        ...prev,
        calories: Math.max(0, prev.calories - calories * quantity),
        entries_count: prev.entries_count - 1,
      } : null);
    } catch (e) {
      console.error("Failed to delete entry:", e);
    } finally {
      setDeletingId(null);
    }
  }

  const grouped = MEAL_CATEGORIES.reduce<Record<string, FoodEntry[]>>((acc, cat) => {
    acc[cat] = log?.entries.filter(e => e.category === cat) ?? [];
    return acc;
  }, {});

  const calPercent = summary ? Math.min((summary.calories / CALORIE_GOAL) * 100, 100) : 0;
  const remaining  = CALORIE_GOAL - (summary?.calories ?? 0);

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <div>
          <p className="label">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
          <h1 className={styles.heading}>Today's Log</h1>
        </div>
        <Link href="/log/add" className="btn-primary">+ Add Food</Link>
      </div>

      {loading ? (
        <div className={styles.skeletons}>
          <div className={styles.skeleton} style={{ height: 120 }} />
          <div className={styles.skeleton} style={{ height: 320 }} />
        </div>
      ) : (
        <>
          {/* Nutrition Summary */}
          <div className={`card ${styles.summaryCard}`}>
            <div className={styles.summaryTop}>
              <div className={styles.calorieBlock}>
                <div className={styles.ringWrap}>
                  <svg className={styles.ring} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--stone-100)" strokeWidth="10"/>
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke={calPercent > 100 ? "#f87171" : "var(--cerulean)"}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - calPercent / 100)}`}
                      transform="rotate(-90 50 50)"
                      style={{ transition: "stroke-dashoffset 0.8s ease" }}
                    />
                  </svg>
                  <div className={styles.ringInner}>
                    <span className={styles.ringNum}>{Math.round(summary?.calories ?? 0)}</span>
                    <span className={styles.ringLabel}>kcal</span>
                  </div>
                </div>
                <div>
                  <p className={styles.calorieTitle}>Calories consumed</p>
                  <p className={styles.calorieSub}>
                    {remaining > 0
                      ? <><strong>{Math.round(remaining)} kcal</strong> remaining of {CALORIE_GOAL}</>
                      : <span style={{ color: "#f87171" }}>Goal reached!</span>
                    }
                  </p>
                </div>
              </div>

              {/* Macro pills */}
              <div className={styles.macroPills}>
                {[
                  { label: "Protein", value: summary?.protein ?? 0, unit: "g", color: "var(--tropical-teal)"},
                  { label: "Carbs", value: summary?.carbohydrates ?? 0, unit: "g", color: "#f59e0b"},
                  { label: "Fats", value: summary?.fats ?? 0, unit: "g", color: "#f87171"},
                  { label: "Items", value: summary?.entries_count ?? 0, unit: "", color: "var(--cerulean)"},
                ].map(m => (
                  <div key={m.label} className={styles.macroPill}>
                    <span className={styles.macroVal} style={{ color: m.color }}>
                      {Math.round(m.value)}{m.unit}
                    </span>
                    <span className={styles.macroLabel}>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress tracker */}
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${calPercent}%`,
                  background: calPercent > 100 ? "#f87171" : "var(--cerulean)"
                }}
              />
            </div>
          </div>

          {/* meal section */}
          <div className={styles.mealGrid}>
            {MEAL_CATEGORIES.map(cat => {
              const entries = grouped[cat];
              const catCalories = entries.reduce(
                (sum, e) => sum + (e.food_item?.calories ?? 0) * e.quantity, 0
              );

              return (
                <div key={cat} className={`card ${styles.mealCard}`}>
                  <div className={styles.mealHeader}>
                    <div className={styles.mealTitleWrap}>
                      <span className={styles.mealIcon}>{MEAL_ICONS[cat]}</span>
                      <div>
                        <h2 className={styles.mealTitle}>{cat}</h2>
                        <p className={styles.mealCalories}>
                          {entries.length > 0 ? `${Math.round(catCalories)} kcal` : "Nothing logged yet"}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/log/add?category=${cat}`}
                      className="btn-ghost"
                      style={{ fontSize: 13, padding: "6px 14px" }}
                    >
                      + Add
                    </Link>
                  </div>

                  {/* Entry list */}
                  {entries.length > 0 ? (
                    <ul className={styles.entryList}>
                      {entries.map(entry => (
                        <li key={entry.id} className={styles.entryRow}>
                          <div className={styles.entryInfo}>
                            <span className={styles.entryName}>{entry.food_item?.name ?? "Unknown food"}</span>
                            <div className={styles.entryMeta}>
                              <span className={styles.entryQty}>×{entry.quantity}</span>
                              <span className={styles.entryDot}>·</span>
                              <span className={styles.entryMacro}>
                                {Math.round((entry.food_item?.protein ?? 0) * entry.quantity)}g protein
                              </span>
                              <span className={styles.entryDot}>·</span>
                              <span className={styles.entryMacro}>
                                {Math.round((entry.food_item?.carbohydrates ?? 0) * entry.quantity)}g carbs
                              </span>
                            </div>
                          </div>
                          <div className={styles.entryRight}>
                            <span className={styles.entryCalories}>
                              {Math.round((entry.food_item?.calories ?? 0) * entry.quantity)} kcal
                            </span>
                            <button
                              className={styles.deleteBtn}
                              onClick={() => deleteEntry(entry.id, entry.food_item?.calories ?? 0, entry.quantity)}
                              disabled={deletingId === entry.id}
                              title="Remove entry"
                            >
                              {deletingId === entry.id ? "…" : "×"}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className={styles.emptyMeal}>
                      <p>No {cat.toLowerCase()} logged.</p>
                      <Link href={`/log/add?category=${cat}`} className={styles.emptyLink}>
                        Add your {cat.toLowerCase()} →
                      </Link>
                    </div>
                  )}

                  {/* Meal subtotal */}
                  {entries.length > 0 && (
                    <div className={styles.mealFooter}>
                      <span className={styles.mealFooterLabel}>{cat} total</span>
                      <span className={styles.mealFooterVal}>{Math.round(catCalories)} kcal</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}