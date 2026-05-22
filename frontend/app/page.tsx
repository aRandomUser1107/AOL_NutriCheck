"use client";

import { FormEvent, useMemo, useState } from "react";

type NutrientKey = "calories" | "protein" | "carbohydrates" | "fats";

interface FoodItem {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
}

interface FoodEntry {
  id: number;
  foodId: number;
  category: string;
  quantity: number;
}

interface NutritionGoal {
  id: number;
  goalType: string;
  targetValue: number;
  unit: string;
  currentValue: number;
}

const healthProfile = {
  age: 20,
  height: 170,
  weight: 62,
  bmi: 21.5,
};

const foodItems: FoodItem[] = [
  { id: 1, name: "Tempeh", calories: 193, protein: 20.3, carbohydrates: 7.6, fats: 10.8 },
  { id: 2, name: "White Rice", calories: 130, protein: 2.7, carbohydrates: 28, fats: 0.3 },
  { id: 3, name: "Chicken Breast", calories: 165, protein: 31, carbohydrates: 0, fats: 3.6 },
  { id: 4, name: "Spinach", calories: 23, protein: 2.9, carbohydrates: 3.6, fats: 0.4 },
];

const baseGoals = [
  { id: 1, goalType: "Calories", targetValue: 2100, unit: "kcal", key: "calories" },
  { id: 2, goalType: "Protein", targetValue: 95, unit: "g", key: "protein" },
  { id: 3, goalType: "Carbohydrates", targetValue: 260, unit: "g", key: "carbohydrates" },
  { id: 4, goalType: "Fats", targetValue: 70, unit: "g", key: "fats" },
] satisfies Array<Omit<NutritionGoal, "currentValue"> & { key: NutrientKey }>;

const articles = [
  { title: "Balanced Plate Basics", writer: "Nutritionist", postDate: "May 2026" },
  { title: "Protein Intake for Busy Students", writer: "Nutritionist", postDate: "May 2026" },
  { title: "Reading Food Labels", writer: "Nutritionist", postDate: "April 2026" },
];

const initialEntries: FoodEntry[] = [
  { id: 1, foodId: 1, category: "Lunch", quantity: 120 },
  { id: 2, foodId: 2, category: "Lunch", quantity: 160 },
];

function formatNumber(value: number) {
  return `${Math.round(value * 10) / 10}`;
}

function getFoodNutrition(food: FoodItem, quantity: number) {
  const multiplier = quantity / 100;

  return {
    calories: food.calories * multiplier,
    protein: food.protein * multiplier,
    carbohydrates: food.carbohydrates * multiplier,
    fats: food.fats * multiplier,
  };
}

function MetricCard({
  title,
  value,
  caption,
  tone,
}: {
  title: string;
  value: string;
  caption: string;
  tone: "blue" | "teal" | "sage" | "mint" | "white";
}) {
  return (
    <article className={`metric-card ${tone}`}>
      <h2>{title}</h2>
      <strong>{value}</strong>
      <p>{caption}</p>
    </article>
  );
}

export default function Home() {
  const [entries, setEntries] = useState<FoodEntry[]>(initialEntries);
  const [selectedFoodId, setSelectedFoodId] = useState(foodItems[0].id);
  const [quantity, setQuantity] = useState(100);
  const [message, setMessage] = useState("");

  const totals = useMemo(() => {
    return entries.reduce(
      (accumulator, entry) => {
        const food = foodItems.find((item) => item.id === entry.foodId);
        if (!food) return accumulator;

        const nutrition = getFoodNutrition(food, entry.quantity);
        accumulator.calories += nutrition.calories;
        accumulator.protein += nutrition.protein;
        accumulator.carbohydrates += nutrition.carbohydrates;
        accumulator.fats += nutrition.fats;
        return accumulator;
      },
      { calories: 0, protein: 0, carbohydrates: 0, fats: 0 },
    );
  }, [entries]);

  const goals: NutritionGoal[] = baseGoals.map((goal) => ({
    ...goal,
    currentValue: totals[goal.key],
  }));

  function handleAddEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!quantity || quantity <= 0) {
      setMessage("Quantity must be greater than 0.");
      return;
    }

    setEntries((current) => [
      { id: Date.now(), foodId: selectedFoodId, category: "Today", quantity },
      ...current,
    ]);
    setMessage("Food entry added and nutrition goals updated.");
  }

  return (
    <main className="dashboard-page">
      <header className="page-heading">
        <div>
          <h1>Nutrition Goals</h1>
          <p>Track daily targets, nutrition logs, and food entries based on the NutriCheck class diagram.</p>
        </div>
        <input className="dashboard-search" placeholder="Search foods, goals, logs" aria-label="Search foods, goals, logs" />
      </header>

      <section className="metric-grid" aria-label="Nutrition goal summary">
        <MetricCard title="Daily Calories" value={formatNumber(totals.calories)} caption="kcal logged today" tone="blue" />
        <MetricCard title="Protein" value={`${formatNumber(totals.protein)}g`} caption="tracked from FoodEntry" tone="teal" />
        <MetricCard title="Carbs" value={`${formatNumber(totals.carbohydrates)}g`} caption="compared to NutritionGoal" tone="sage" />
        <MetricCard title="Fats" value={`${formatNumber(totals.fats)}g`} caption="daily target check" tone="mint" />
        <MetricCard title="Today Progress" value="72%" caption="goals on track" tone="white" />
      </section>

      <section className="dashboard-grid">
        <article className="panel nutrition-goal-panel">
          <div className="panel-head">
            <h2>NutritionGoal Progress</h2>
            <span className="method-pill">getGoal()</span>
          </div>

          <div className="goal-list">
            {goals.map((goal) => {
              const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
              return (
                <div className="goal-row" key={goal.id}>
                  <div className="goal-meta">
                    <strong>{goal.goalType}</strong>
                    <span>
                      {formatNumber(goal.currentValue)} / {goal.targetValue} {goal.unit}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="panel health-panel">
          <div className="panel-head">
            <h2>HealthProfile</h2>
            <span className="method-pill">calculateBMI()</span>
          </div>

          <div className="health-content">
            <div>
              <span>BMI</span>
              <strong>{healthProfile.bmi}</strong>
            </div>
            <ul>
              <li>Age: {healthProfile.age}</li>
              <li>Height: {healthProfile.height} cm</li>
              <li>Weight: {healthProfile.weight} kg</li>
              <li>Goal: Balanced nutrition</li>
            </ul>
          </div>
        </article>

        <article className="panel log-panel">
          <div className="panel-head">
            <h2>NutritionLog + FoodEntry</h2>
            <span className="method-pill">addFoodEntry()</span>
          </div>

          <form className="entry-form" onSubmit={handleAddEntry}>
            <label>
              Food item
              <select value={selectedFoodId} onChange={(event) => setSelectedFoodId(Number(event.target.value))}>
                {foodItems.map((food) => (
                  <option value={food.id} key={food.id}>
                    {food.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantity
              <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
            </label>
            <button type="submit">Add Entry</button>
          </form>

          <p className={message.includes("greater") ? "form-message error" : "form-message"}>{message}</p>

          <div className="entry-list">
            {entries.map((entry) => {
              const food = foodItems.find((item) => item.id === entry.foodId);
              return (
                <div className="entry-row" key={entry.id}>
                  <strong>{food?.name}</strong>
                  <span>
                    {entry.category} - {entry.quantity}g - getNutrition()
                  </span>
                </div>
              );
            })}
          </div>
        </article>

        <article className="panel food-panel">
          <div className="panel-head">
            <h2>FoodItem</h2>
            <span className="method-pill">getNutritionInfo()</span>
          </div>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Cal</th>
                <th>Protein</th>
              </tr>
            </thead>
            <tbody>
              {foodItems.map((food) => (
                <tr key={food.id}>
                  <td>{food.name}</td>
                  <td>{food.calories}</td>
                  <td>{food.protein}g</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="panel article-panel">
          <div className="panel-head">
            <h2>Articles</h2>
            <span className="method-pill">viewArticle()</span>
          </div>

          <div className="article-list">
            {articles.map((article) => (
              <section className="article-card" key={article.title}>
                <span>
                  {article.writer} - {article.postDate}
                </span>
                <strong>{article.title}</strong>
                <p>Nutritionist content for better daily nutrition decisions.</p>
              </section>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
