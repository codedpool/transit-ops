// Display formatting helpers. Enum values are SCREAMING_SNAKE in the API;
// the UI shows Title Case (e.g. ON_TRIP -> "On Trip"). Keep labels here so
// every screen renders statuses/types identically.

export function titleize(enumValue = "") {
  return String(enumValue)
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

// statusLabel / typeLabel are the same title-casing, named for intent.
export const statusLabel = titleize;
export const typeLabel = titleize;

export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// For <input type="date"> value binding (YYYY-MM-DD).
export function toDateInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function formatCurrency(value) {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return "₹" + n.toLocaleString("en-IN");
}

export function formatNumber(value, unit = "") {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("en-IN") + (unit ? ` ${unit}` : "");
}
