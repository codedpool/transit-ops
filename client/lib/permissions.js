// Client-side permission check against the map returned by /auth/me.
// Mirrors the server matrix; used only to show/hide UI — the backend enforces.
export function can(permissions, module, action) {
  const mod = permissions && permissions[module];
  return Array.isArray(mod) && mod.includes(action);
}

// Enum option lists for form selects (kept in sync with the Prisma schema).
export const VEHICLE_TYPES = ["TRUCK", "VAN", "MINI", "CAR", "BUS", "TRAILER", "PICKUP", "OTHER"];
export const VEHICLE_STATUSES = ["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"];
export const DRIVER_STATUSES = ["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"];
export const EXPENSE_CATEGORIES = ["TOLL", "MAINTENANCE", "PARKING", "INSURANCE", "FINE", "OTHER"];
