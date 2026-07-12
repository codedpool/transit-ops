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

// Build a query string from a plain searchParams object, dropping empties.
function qs(params = {}) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "") sp.set(k, Array.isArray(v) ? v[0] : v);
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { cookie: await cookieHeader() },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${path} responded ${res.status}`);
  return res.json();
}

// Vehicles
export function getVehicles(searchParams) {
  return apiGet(`/vehicles${qs(searchParams)}`);
}
export function getVehicle(id) {
  return apiGet(`/vehicles/${id}`);
}

// Drivers
export function getDrivers(searchParams) {
  return apiGet(`/drivers${qs(searchParams)}`);
}
export function getDriver(id) {
  return apiGet(`/drivers/${id}`);
}

// Fuel & expenses
export function getFuelLogs(query) {
  return apiGet(`/fuel${qs(query)}`);
}
export function getExpenses(query) {
  return apiGet(`/expenses${qs(query)}`);
}
export function getFuelExpenseOptions() {
  return apiGet(`/fuel/options`);
}
export async function getCostSummary() {
  const res = await apiGet(`/expenses/cost-summary`);
  return res?.data || [];
}

// Trips
export async function getTrips(status) {
  const query = status && status !== "all" ? `?status=${status}` : "";
  try {
    const res = await fetch(`${API_BASE}/trips${query}`, {
      headers: { cookie: await cookieHeader() },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function getTripOptions() {
  try {
    const res = await fetch(`${API_BASE}/trips/options`, {
      headers: { cookie: await cookieHeader() },
      cache: "no-store",
    });
    if (!res.ok) return { vehicles: [], drivers: [] };
    return res.json();
  } catch {
    return { vehicles: [], drivers: [] };
  }
}

// Maintenance
export async function getMaintenance() {
  try {
    const res = await fetch(`${API_BASE}/maintenance`, {
      headers: { cookie: await cookieHeader() },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function getMaintenanceOptions() {
  try {
    const res = await fetch(`${API_BASE}/maintenance/options`, {
      headers: { cookie: await cookieHeader() },
      cache: "no-store",
    });
    if (!res.ok) return { vehicles: [] };
    return res.json();
  } catch {
    return { vehicles: [] };
  }
}

// Analytics / reports
export async function getAnalytics() {
  try {
    const res = await fetch(`${API_BASE}/reports/overview`, {
      headers: { cookie: await cookieHeader() },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
