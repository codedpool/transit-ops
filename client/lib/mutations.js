// CLIENT-SIDE write helpers. Used by forms/buttons in Client Components.
// Sends the auth cookie (credentials: include) plus the double-submit CSRF
// header the backend requires on state-changing requests.
import { API_BASE } from "@/lib/config";

function readCsrfToken() {
  if (typeof document === "undefined") return "";
  const match = document.cookie.split("; ").find((c) => c.startsWith("csrf_token="));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
}

// Throws an Error with a `.details` array ([{field,message}]) on validation
// failure, and `.status` for the HTTP code, so forms can render field errors.
async function apiWrite(path, method, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token": readCsrfToken(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.message || `Request failed (${res.status}).`);
    err.status = res.status;
    err.details = data?.error?.details || [];
    err.code = data?.error?.code;
    throw err;
  }
  return data;
}

// Vehicles
export const createVehicle = (body) => apiWrite("/vehicles", "POST", body);
export const updateVehicle = (id, body) => apiWrite(`/vehicles/${id}`, "PUT", body);
export const deleteVehicle = (id) => apiWrite(`/vehicles/${id}`, "DELETE");

// Drivers
export const createDriver = (body) => apiWrite("/drivers", "POST", body);
export const updateDriver = (id, body) => apiWrite(`/drivers/${id}`, "PUT", body);
export const deleteDriver = (id) => apiWrite(`/drivers/${id}`, "DELETE");

// Fuel logs
export const createFuelLog = (body) => apiWrite("/fuel", "POST", body);
export const deleteFuelLog = (id) => apiWrite(`/fuel/${id}`, "DELETE");

// Expenses
export const createExpense = (body) => apiWrite("/expenses", "POST", body);
export const deleteExpense = (id) => apiWrite(`/expenses/${id}`, "DELETE");
