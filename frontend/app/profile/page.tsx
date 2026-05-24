"use client";

import { useEffect, useState } from "react";
import { apiFetch, USER_ID } from "@/lib/api";
import styles from "./profile.module.css";

type Profile = { id?: number; age: number; height: number; weight: number };
type Goal = { id: number; goalType: string; targetValue: number; unit: string };
type Bmi = { bmi: number; category: string };

const GOAL_PRESETS = [
  { goalType: "calories",  unit: "kcal", placeholder: "e.g. 2000" },
  { goalType: "protein",   unit: "g",    placeholder: "e.g. 120"  },
  { goalType: "carbs",     unit: "g",    placeholder: "e.g. 250"  },
  { goalType: "fats",      unit: "g",    placeholder: "e.g. 65"   },
  { goalType: "weight",    unit: "kg",   placeholder: "e.g. 70"   },
];

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export default function ProfilePage() {
  const [profile, setProfile]         = useState<Profile | null>(null);
  const [bmi, setBmi]                 = useState<Bmi | null>(null);
  const [goals, setGoals]             = useState<Goal[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [saveMsg, setSaveMsg]         = useState("");

  // form state
  const [age, setAge]       = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // new goal form
  const [goalType, setGoalType]     = useState("calories");
  const [goalValue, setGoalValue]   = useState("");
  const [addingGoal, setAddingGoal] = useState(false);
  const [goalMsg, setGoalMsg]       = useState("");

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [profileData, goalsData] = await Promise.allSettled([
        apiFetch(`/api/users/${USER_ID}/profile`),
        apiFetch(`/api/users/${USER_ID}/goals`),
      ]);
      if (profileData.status === "fulfilled") {
        const p = profileData.value;
        setProfile(p);
        setAge(String(p.age));
        setHeight(String(p.height));
        setWeight(String(p.weight));
        // load BMI too
        const bmiData = await apiFetch(`/api/users/${USER_ID}/bmi`).catch(() => null);
        if (bmiData) setBmi(bmiData);
      }
      if (goalsData.status === "fulfilled") setGoals(goalsData.value);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    if (!age || !height || !weight) { setSaveMsg("Please fill all fields."); return; }
    setSaving(true); setSaveMsg("");
    try {
      const body = { age: Number(age), height: Number(height), weight: Number(weight) };
      const method = profile?.id ? "PUT" : "POST";
      const saved = await apiFetch(`/api/users/${USER_ID}/profile`, {
        method,
        body: JSON.stringify(body),
      });
      setProfile(saved);
      const bmiData = await apiFetch(`/api/users/${USER_ID}/bmi`).catch(() => null);
      if (bmiData) setBmi(bmiData);
      setSaveMsg("Profile saved!");
    } catch (error: unknown) {
      setSaveMsg(getErrorMessage(error));
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  }

  async function addGoal() {
    if (!goalValue) { setGoalMsg("Enter a target value."); return; }
    setAddingGoal(true); setGoalMsg("");
    try {
      const preset = GOAL_PRESETS.find(p => p.goalType === goalType)!;
      const newGoal = await apiFetch(`/api/users/${USER_ID}/goals`, {
        method: "POST",
        body: JSON.stringify({ goalType, targetValue: Number(goalValue), unit: preset.unit }),
      });
      setGoals(prev => [...prev, newGoal]);
      setGoalValue("");
      setGoalMsg("Goal added!");
    } catch (error: unknown) {
      setGoalMsg(getErrorMessage(error));
    } finally {
      setAddingGoal(false);
      setTimeout(() => setGoalMsg(""), 3000);
    }
  }

  async function deleteGoal(id: number) {
    // optimistic update
    setGoals(prev => prev.filter(g => g.id !== id));
    await apiFetch(`/api/goals/${id}`, { method: "DELETE" }).catch(() => loadAll());
  }

  const bmiColor =
    !bmi ? "var(--text-muted)" :
    bmi.category === "Normal weight" ? "var(--green-600)" :
    bmi.category === "Underweight"   ? "#2563eb" :
    bmi.category === "Overweight"    ? "#d97706" : "#dc2626";

  const bmiPos = bmi ? Math.min(Math.max(((bmi.bmi - 10) / (40 - 10)) * 100, 0), 100) : null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <p className="label">My Account</p>
        <h1 className={styles.heading}>Health Profile</h1>
        <p className={styles.sub}>Keep your info up to date for accurate nutrition tracking.</p>
      </div>

      {loading ? (
        <div className={styles.skeletons}>
          {[1,2].map(i => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : (
        <div className={styles.grid}>

          {/* ── Left column ── */}
          <div className={styles.leftCol}>

            {/* Profile form */}
            <div className={`card ${styles.card}`}>
              <h2 className={styles.cardTitle}>Body Measurements</h2>
              <div className={styles.fieldGroup}>
                <div className={styles.field}>
                  <label className={styles.label}>Age</label>
                  <div className={styles.inputWrap}>
                    <input className={styles.input} type="number" min="1" max="120"
                      value={age} onChange={e => setAge(e.target.value)} placeholder="your age" />
                    <span className={styles.unit}>years</span>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Height</label>
                  <div className={styles.inputWrap}>
                    <input className={styles.input} type="number" min="50" max="300"
                      value={height} onChange={e => setHeight(e.target.value)} placeholder="your height in cm" />
                    <span className={styles.unit}>cm</span>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Weight</label>
                  <div className={styles.inputWrap}>
                    <input className={styles.input} type="number" min="1" max="500"
                      value={weight} onChange={e => setWeight(e.target.value)} placeholder="your weight in kg" />
                    <span className={styles.unit}>kg</span>
                  </div>
                </div>
              </div>
              <div className={styles.formFooter}>
                {saveMsg && <span className={`${styles.msg} ${saveMsg.includes("!") ? styles.success : styles.error}`}>{saveMsg}</span>}
                <button className="btn-primary" onClick={saveProfile} disabled={saving}>
                  {saving ? "Saving…" : profile?.id ? "Update Profile" : "Save Profile"}
                </button>
              </div>
            </div>

            {/* Nutrition Goals */}
            <div className={`card ${styles.card}`}>
              <h2 className={styles.cardTitle}>Nutrition Goals</h2>

              {goals.length > 0 ? (
                <ul className={styles.goalList}>
                  {goals.map(g => (
                    <li key={g.id} className={styles.goalItem}>
                      <div className={styles.goalInfo}>
                        <span className={styles.goalType}>{g.goalType}</span>
                        <span className={styles.goalTarget}>{g.targetValue} {g.unit}</span>
                      </div>
                      <button className={styles.deleteBtn} onClick={() => deleteGoal(g.id)} title="Remove goal">×</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.emptyGoals}>No goals set yet.</p>
              )}

              {/* Add goal form */}
              <div className={styles.addGoalForm}>
                <select className={styles.select} value={goalType} onChange={e => setGoalType(e.target.value)}>
                  {GOAL_PRESETS.map(p => (
                    <option key={p.goalType} value={p.goalType}>{p.goalType}</option>
                  ))}
                </select>
                <div className={styles.inputWrap} style={{ flex: 1 }}>
                  <input
                    className={styles.input}
                    type="number" min="0"
                    value={goalValue}
                    onChange={e => setGoalValue(e.target.value)}
                    placeholder={GOAL_PRESETS.find(p => p.goalType === goalType)?.placeholder}
                  />
                  <span className={styles.unit}>{GOAL_PRESETS.find(p => p.goalType === goalType)?.unit}</span>
                </div>
                <button className="btn-primary" onClick={addGoal} disabled={addingGoal}>
                  {addingGoal ? "…" : "Add"}
                </button>
              </div>
              {goalMsg && <p className={`${styles.msg} ${goalMsg.includes("!") ? styles.success : styles.error}`}>{goalMsg}</p>}
            </div>
          </div>

          {/* ── Right column — BMI ── */}
          <div className={styles.rightCol}>
            <div className={`card ${styles.card}`}>
              <h2 className={styles.cardTitle}>BMI Calculator</h2>

              {bmi ? (
                <>
                  <div className={styles.bmiDisplay}>
                    <span className={styles.bmiNum} style={{ color: bmiColor }}>{bmi.bmi}</span>
                    <span className={styles.bmiCat} style={{ color: bmiColor }}>{bmi.category}</span>
                  </div>

                  <div className={styles.scaleWrap}>
                    <div className={styles.scaleBar}>
                      <div className={styles.scaleUnder}  title="Underweight <18.5" />
                      <div className={styles.scaleNormal} title="Normal 18.5–24.9" />
                      <div className={styles.scaleOver}   title="Overweight 25–29.9" />
                      <div className={styles.scaleObese}  title="Obese ≥30" />
                    </div>
                    {bmiPos !== null && (
                      <div className={styles.scaleMarker} style={{ left: `${bmiPos}%` }} />
                    )}
                    <div className={styles.scaleLabels}>
                      <span>10</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
                    </div>
                  </div>

                  <div className={styles.bmiRanges}>
                    {[
                      { label: "Underweight", range: "< 18.5",    color: "#2563eb" },
                      { label: "Normal",      range: "18.5–24.9", color: "var(--green-600)" },
                      { label: "Overweight",  range: "25–29.9",   color: "#d97706" },
                      { label: "Obese",       range: "≥ 30",      color: "#dc2626" },
                    ].map(r => (
                      <div key={r.label} className={styles.bmiRange}>
                        <span className={styles.bmiDot} style={{ background: r.color }} />
                        <span className={styles.bmiRangeLabel}>{r.label}</span>
                        <span className={styles.bmiRangeVal}>{r.range}</span>
                      </div>
                    ))}
                  </div>

                  <p className={styles.bmiFormula}>BMI = weight (kg) ÷ height² (m)</p>
                </>
              ) : (
                <div className={styles.bmiEmpty}>
                  <p>Fill in your measurements and save your profile to see your BMI.</p>
                </div>
              )}
            </div>

            {profile && (
              <div className={`card ${styles.card}`}>
                <h2 className={styles.cardTitle}>Quick Stats</h2>
                <div className={styles.statList}>
                  {[
                    { label: "Age",    value: `${profile.age} yrs` },
                    { label: "Height", value: `${profile.height} cm` },
                    { label: "Weight", value: `${profile.weight} kg` },
                  ].map(s => (
                    <div key={s.label} className={styles.statRow}>
                      <span className={styles.statLabel}>{s.label}</span>
                      <span className={styles.statValue}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
