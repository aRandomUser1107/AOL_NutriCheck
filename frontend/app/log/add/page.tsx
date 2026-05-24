"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch, USER_ID } from "@/lib/api";
import styles from "./add.module.css";
import { FiSearch } from "react-icons/fi";
import { GiFruitBowl } from "react-icons/gi";
import { MdFreeBreakfast } from "react-icons/md";
import { FaCloudSun } from "react-icons/fa";
import { IoIosCloudyNight } from "react-icons/io";
import { GiShinyApple } from "react-icons/gi";
import { GiMuscleFat } from "react-icons/gi";
import { GiBroccoli } from "react-icons/gi";
import { GiMeat } from "react-icons/gi";

/*
properties and methods for add log page:
- FoodItem: store food nutrition information
- variables for meal categories, icons, calory range, and sorting option
- function to filter and sort food based on category or nutrition information and to clear it
- function to add food item to log
- calculator to total the calories (based on quantity)
*/

type FoodItem = {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
};

const MEAL_CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const MEAL_ICONS: Record<string, React.ReactNode> = {
  Breakfast: <MdFreeBreakfast />, Lunch: <FaCloudSun />, Dinner: <IoIosCloudyNight />, Snack: <GiShinyApple />,
};

// filter based on calories
const CAL_RANGES = [
  { label: "All",        min: 0,   max: Infinity },
  { label: "< 100",     min: 0,   max: 100       },
  { label: "100–300",   min: 100, max: 300       },
  { label: "300–500",   min: 300, max: 500       },
  { label: "500+",      min: 500, max: Infinity  },
];

// sorting options
type SortKey = "name" | "calories_asc" | "calories_desc" | "protein";
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "name",          label: "Name A–Z"       },
  { value: "calories_asc",  label: "Calories ↑"     },
  { value: "calories_desc", label: "Calories ↓"     },
  { value: "protein",       label: "Highest Protein" },
];

function applyFiltersAndSort(
  foods: FoodItem[],
  query: string,
  calRange: typeof CAL_RANGES[number],
  sort: SortKey,
  highProtein: boolean,
  lowCarb: boolean,
  lowFat: boolean,
): FoodItem[] {
  let result = [...foods];

  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter(f => f.name.toLowerCase().includes(q));
  }

  result = result.filter(f => f.calories >= calRange.min && f.calories < calRange.max);

  if (highProtein) result = result.filter(f => f.protein >= 15);
  if (lowCarb)     result = result.filter(f => f.carbohydrates <= 20);
  if (lowFat)      result = result.filter(f => f.fats <= 5);

  result.sort((a, b) => {
    if (sort === "name")          return a.name.localeCompare(b.name);
    if (sort === "calories_asc")  return a.calories - b.calories;
    if (sort === "calories_desc") return b.calories - a.calories;
    if (sort === "protein")       return b.protein - a.protein;
    return 0;
  });

  return result;
}

function AddFoodInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const defaultCat   = searchParams.get("category") || "Breakfast";

  // Data
  const [allFoods, setAllFoods] = useState<FoodItem[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(true);

  // Filters
  const [query, setQuery]           = useState("");
  const [calRange, setCalRange]     = useState(CAL_RANGES[0]);
  const [sort, setSort]             = useState<SortKey>("name");
  const [highProtein, setHighProtein] = useState(false);
  const [lowCarb, setLowCarb]       = useState(false);
  const [lowFat, setLowFat]         = useState(false);

  // View toggle
  const [view, setView] = useState<"grid" | "list">("grid");

  // Selection
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [category, setCategory] = useState(defaultCat);
  const [quantity, setQuantity] = useState(1);

  // Submit
  const [adding, setAdding]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    apiFetch("/api/foods/")
      .then(data => setAllFoods(data))
      .catch(() => {})
      .finally(() => setLoadingFoods(false));
  }, []);

  const filtered = applyFiltersAndSort(allFoods, query, calRange, sort, highProtein, lowCarb, lowFat);

  const activeFilterCount = [
    calRange !== CAL_RANGES[0],
    highProtein, lowCarb, lowFat,
    sort !== "name",
  ].filter(Boolean).length;

  function clearFilters() {
    setCalRange(CAL_RANGES[0]);
    setSort("name");
    setHighProtein(false);
    setLowCarb(false);
    setLowFat(false);
    setQuery("");
  }

  async function addToLog() {
    if (!selected) { setError("Please select a food item."); return; }
    setAdding(true); setError("");
    try {
      await apiFetch(`/api/logs/${USER_ID}/entries`, {
        method: "POST",
        body: JSON.stringify({ food_id: selected.id, category, quantity }),
      });
      setSuccess(true);
      setTimeout(() => router.push("/log"), 1200);
    } catch (e: any) {
      setError(e.message || "Failed to add food entry.");
      setAdding(false);
    }
  }

  const totalCal = selected ? Math.round(selected.calories * quantity) : 0;

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <Link href="/log" className={styles.btnBack}>Back</Link>
        <div>
          <h1 className={styles.heading}>Food Catalogue</h1>
          <p className={styles.sub}>Browse, filter and add food to your log.</p>
        </div>
      </div>

      <div className={styles.layout}>

        {/* The catalouge and filters */}
        <div className={styles.catalogueCol}>

          {/* Search and view toggle */}
          <div className={styles.searchRow}>
            <div className={styles.searchWrap}>
                <FiSearch className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                type="text"
                placeholder="Search food name…"
                value={query}
                onChange={e => { setQuery(e.target.value); setSelected(null); }}
                autoFocus
              />
              {query && (
                <button className={styles.clearBtn} onClick={() => { setQuery(""); setSelected(null); }}>×</button>
              )}
            </div>
            <div className={styles.viewToggle}>
              <button className={`${styles.viewBtn} ${view === "grid" ? styles.viewActive : ""}`} onClick={() => setView("grid")}>⊞</button>
              <button className={`${styles.viewBtn} ${view === "list" ? styles.viewActive : ""}`} onClick={() => setView("list")}>≡</button>
            </div>
          </div>

          {/* Filter bar */}
          <div className={`card ${styles.filterBar}`}>
            <div className={styles.filterTop}>
              <span className={styles.filterTitle}>
                Filters {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
              </span>
              {activeFilterCount > 0 && (
                <button className={styles.clearFilters} onClick={clearFilters}>Clear all</button>
              )}
            </div>

            <div className={styles.filterSections}>
              {/* Calories */}
              <div className={styles.filterGroup}>
                <p className={styles.filterGroupLabel}>Calories</p>
                <div className={styles.filterChips}>
                  {CAL_RANGES.map(r => (
                    <button
                      key={r.label}
                      className={`${styles.chip} ${calRange.label === r.label ? styles.chipActive : ""}`}
                      onClick={() => setCalRange(r)}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick filters */}
              <div className={styles.filterGroup}>
                <p className={styles.filterGroupLabel}>Quick Filters</p>
                <div className={styles.filterChips}>
                  <button
                    className={`${styles.chip} ${highProtein ? styles.chipActive : ""}`}
                    onClick={() => setHighProtein(v => !v)}
                  >
                    <GiMuscleFat /> High Protein ≥15g
                  </button>
                  <button
                    className={`${styles.chip} ${lowCarb ? styles.chipActive : ""}`}
                    onClick={() => setLowCarb(v => !v)}
                  >
                    <GiBroccoli /> Low Carb ≤20g
                  </button>
                  <button
                    className={`${styles.chip} ${lowFat ? styles.chipActive : ""}`}
                    onClick={() => setLowFat(v => !v)}
                  >
                    <GiMeat /> Low Fat ≤5g
                  </button>
                </div>
              </div>

              {/* Sort */}
              <div className={styles.filterGroup}>
                <p className={styles.filterGroupLabel}>Sort by</p>
                <div className={styles.filterChips}>
                  {SORT_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      className={`${styles.chip} ${sort === o.value ? styles.chipActive : ""}`}
                      onClick={() => setSort(o.value)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* To count the results */}
          <div className={styles.resultsCount}>
            {loadingFoods ? "Loading catalogue…" : `${filtered.length} food${filtered.length !== 1 ? "s" : ""} found`}
            {query && <span> for "<strong>{query}</strong>"</span>}
          </div>

          {/* load food catalogue */}
          {loadingFoods ? (
            <div className={styles.skeletonGrid}>
              {[...Array(8)].map((_, i) => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.noResults}>
              <p>No foods match your filters.</p>
              <button className="btn-ghost" onClick={clearFilters} style={{ marginTop: 12 }}>Clear filters</button>
            </div>
          ) : view === "grid" ? (
            <div className={styles.foodGrid}>
              {filtered.map(food => (
                <div
                  key={food.id}
                  className={`card ${styles.foodCard} ${selected?.id === food.id ? styles.foodCardSelected : ""}`}
                  onClick={() => setSelected(food)}
                >
                  {selected?.id === food.id && <span className={styles.foodCardCheck}>✓</span>}
                  <p className={styles.foodCardName}>{food.name}</p>
                  <p className={styles.foodCardCal}>
                    <strong>{food.calories}</strong> kcal
                  </p>
                  <div className={styles.foodCardMacros}>
                    <span style={{ color: "var(--tropical-teal)" }}>P {food.protein}g</span>
                    <span style={{ color: "#f59e0b" }}>C {food.carbohydrates}g</span>
                    <span style={{ color: "#f87171" }}>F {food.fats}g</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`card ${styles.listWrap}`}>
              <ul className={styles.foodList}>
                {filtered.map(food => (
                  <li
                    key={food.id}
                    className={`${styles.foodRow} ${selected?.id === food.id ? styles.foodRowSelected : ""}`}
                    onClick={() => setSelected(food)}
                  >
                    <div className={styles.foodRowInfo}>
                      <span className={styles.foodRowName}>{food.name}</span>
                      <div className={styles.foodRowMacros}>
                        <span>Protein {food.protein}g</span>
                        <span>·</span>
                        <span>Carbs {food.carbohydrates}g</span>
                        <span>·</span>
                        <span>Fats {food.fats}g</span>
                      </div>
                    </div>
                    <div className={styles.foodRowRight}>
                      <span className={styles.foodRowCal}>{food.calories} <small>kcal</small></span>
                      {selected?.id === food.id && <span className={styles.rowCheck}>✓</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={styles.configCol}>

          {/* Preview */}
          <div className={`card ${styles.previewCard}`}>
            {selected ? (
              <>
                <p className="label">Selected</p>
                <h2 className={styles.selectedName}>{selected.name}</h2>
                <div className={styles.nutriGrid}>
                  {[
                    { label: "Calories", value: Math.round(selected.calories * quantity), unit: "kcal", color: "var(--cerulean)"      },
                    { label: "Protein",  value: Math.round(selected.protein * quantity),  unit: "g",    color: "var(--tropical-teal)" },
                    { label: "Carbs",    value: Math.round(selected.carbohydrates * quantity), unit: "g", color: "#f59e0b"           },
                    { label: "Fats",     value: Math.round(selected.fats * quantity),     unit: "g",    color: "#f87171"             },
                  ].map(n => (
                    <div key={n.label} className={styles.nutriItem}>
                      <span className={styles.nutriVal} style={{ color: n.color }}>{n.value}{n.unit}</span>
                      <span className={styles.nutriLabel}>{n.label}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.previewPlaceholder}>
                <GiFruitBowl size={60}/>
                <p>Select a food from the catalogue to see its nutrition info.</p>
              </div>
            )}
          </div>

          {/* Configure */}
          <div className={`card ${styles.configCard}`}>
            <h2 className={styles.cardTitle}>Add to Log</h2>

            {/* Quantity */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Quantity (servings)</label>
              <div className={styles.quantityRow}>
                <button className={styles.qtyBtn} onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>−</button>
                <input
                  className={styles.qtyInput}
                  type="number" min={1} max={99}
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <button className={styles.qtyBtn} onClick={() => setQuantity(q => Math.min(99, q + 1))}>+</button>
              </div>
            </div>

            {/* Meal */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Meal</label>
              <div className={styles.catGrid}>
                {MEAL_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    className={`${styles.catBtn} ${category === cat ? styles.catActive : ""}`}
                    onClick={() => setCategory(cat)}
                  >
                    <span>{MEAL_ICONS[cat]}</span>{cat}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}

            <button
              className={styles.submitBtn}
              onClick={addToLog}
              disabled={adding || !selected || success}
            >
              {success ? <>Added! Redirecting…</>
               : adding ? <><span className={styles.spinner} /> Adding…</>
               : <>+ Add {selected ? `${totalCal} kcal` : "to Log"}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AddFoodPage() {
  return (
    <Suspense>
      <AddFoodInner />
    </Suspense>
  );
}