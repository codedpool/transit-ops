// Client-safe config (no server-only imports). Base URL of the Express API.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
