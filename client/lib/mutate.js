// Client-side mutation helper. Sends credentials + the CSRF token (double-submit)
// required by the Express API for state-changing requests. Raises a toast on
// success/failure so every action gives the user feedback.
import { API_BASE } from "@/lib/config";
import { toast } from "@/components/ToastProvider";

function csrfToken() {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith("csrf_token="));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
}

export async function apiMutate(path, { method = "POST", body } = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken(),
      },
      body: body != null ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error?.message || `Request failed (${res.status}).`);
    }
    toast(method === "DELETE" ? "Deleted." : "Saved.");
    return data;
  } catch (e) {
    toast(e.message, "error");
    throw e;
  }
}
