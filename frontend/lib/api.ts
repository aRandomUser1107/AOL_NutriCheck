const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

// temporary (auth not yet implemented)
export const USER_ID = 1;

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }

  // content has no body
  if (res.status === 204) return null;
  return res.json();
}
