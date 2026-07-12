// Client-side API helpers. Base URL points at the Express server.
const API_BASE = process.env.API_URL || "http://localhost:4000/api";

export async function getDashboardSummary() {
  const res = await fetch(`${API_BASE}/dashboard/summary`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Dashboard API responded ${res.status}`);
  return res.json();
}
