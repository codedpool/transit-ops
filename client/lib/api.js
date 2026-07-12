// SERVER-ONLY data helpers (imports next/headers). Do not import from Client Components.
// Forwards the browser's auth cookies to the Express API so requests are authenticated.
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/config";

async function cookieHeader() {
  const store = await cookies();
  return store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

// Current session: { user, permissions } or null when not authenticated.
export async function getSession() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { cookie: await cookieHeader() },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getDashboardSummary() {
  const res = await fetch(`${API_BASE}/dashboard/summary`, {
    headers: { cookie: await cookieHeader() },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Dashboard API responded ${res.status}`);
  return res.json();
}
