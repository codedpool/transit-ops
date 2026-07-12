"use client";

// Global search box. Submitting jumps to the Fleet list with the query applied
// (fleet has real server-side search over registration number and name/model).
// Visual treatment (icon + "/" affordance) follows the console design.
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TopbarSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/fleet?q=${encodeURIComponent(term)}` : "/fleet");
  }

  return (
    <form onSubmit={onSubmit} className="relative w-full max-w-xs">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search vehicles…"
        aria-label="Search vehicles"
        className="w-full rounded-md border border-slate-800 bg-slate-800/40 py-2 pl-9 pr-9 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-400/60 focus:bg-transparent focus:outline-none"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-slate-700 px-1.5 py-px font-mono text-[10px] text-slate-500 sm:block">
        /
      </kbd>
    </form>
  );
}
