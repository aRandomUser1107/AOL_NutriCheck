const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

/*
  function to connect to backend API:
  - getToken: retrieves JWT token from storage
  - saveSession: saves token and user info to storage
  - clearSession: clears all session data from storage
  - getUserId, getRole, getUsername, getNutritionistId: read specific session values
  - isLoggedIn: checks if a token exists
  - apiFetch: wrapper around fetch that adds auth header and handles errors
*/

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("nutricheck_token");
}

export function saveSession(data: {
  access_token: string;
  user_id: number;
  username: string;
  role: "user" | "nutritionist";
  nutritionist_id: number | null;
}) {
  localStorage.setItem("nutricheck_token",           data.access_token);
  localStorage.setItem("nutricheck_user_id",         String(data.user_id));
  localStorage.setItem("nutricheck_username",        data.username);
  localStorage.setItem("nutricheck_role",            data.role);
  localStorage.setItem("nutricheck_nutritionist_id", String(data.nutritionist_id ?? ""));
}

export function clearSession() {
  ["nutricheck_token", "nutricheck_user_id", "nutricheck_username",
   "nutricheck_role", "nutricheck_nutritionist_id"].forEach(k => localStorage.removeItem(k));
}

export function getUserId(): number {
  return parseInt(localStorage.getItem("nutricheck_user_id") ?? "0");
}

export function getRole(): "user" | "nutritionist" {
  return (localStorage.getItem("nutricheck_role") ?? "user") as "user" | "nutritionist";
}

export function getUsername(): string {
  return localStorage.getItem("nutricheck_username") ?? "";
}

export function getNutritionistId(): number | null {
  const val = localStorage.getItem("nutricheck_nutritionist_id");
  return val ? parseInt(val) : null;
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export async function apiFetch(path: string, options?: RequestInit) {
  const token = getToken();

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));

    if (res.status === 401) {
      clearSession();
      if (typeof window !== "undefined") window.location.href = "/login";
    }

    throw new Error(err.detail || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}