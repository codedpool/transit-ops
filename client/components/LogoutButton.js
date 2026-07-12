"use client";

import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/config";

function readCsrfToken() {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith("csrf_token="));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
}

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "x-csrf-token": readCsrfToken() },
      });
    } catch {
      // ignore — clear client state regardless
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="rounded-md border border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-slate-700 hover:bg-slate-800/50 hover:text-slate-200"
    >
      Logout
    </button>
  );
}
