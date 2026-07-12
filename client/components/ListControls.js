"use client";

// Reusable list toolbar: search + filter selects + sort, all driven through the
// URL query string. Changing any control pushes new searchParams, which re-runs
// the server component's data fetch — so filtering/sorting is REAL (server-side),
// not client-only. `filters` and `sorts` are configured per entity by the page.
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { inputClass } from "@/components/FormField";

export default function ListControls({ filters = [], sorts = [], searchPlaceholder = "Search…" }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");

  function push(next) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v == null || v === "") sp.delete(k);
      else sp.set(k, v);
    }
    sp.delete("page"); // any filter/search/sort change resets to page 1
    router.push(`${pathname}?${sp.toString()}`);
  }

  function onSearch(e) {
    e.preventDefault();
    push({ q });
  }

  const currentSort = params.get("sortBy") || "";
  const currentDir = params.get("sortDir") || "desc";

  return (
    <div className="flex flex-wrap items-end gap-3">
      <form onSubmit={onSearch} className="flex items-end gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-500">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className={`${inputClass} min-w-[220px]`}
          />
        </label>
        <button
          type="submit"
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/60"
        >
          Go
        </button>
      </form>

      {filters.map((f) => (
        <label key={f.name} className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-500">{f.label}</span>
          <select
            value={params.get(f.name) || ""}
            onChange={(e) => push({ [f.name]: e.target.value })}
            className={`${inputClass} min-w-[150px]`}
          >
            <option value="">All</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      ))}

      {sorts.length > 0 && (
        <label className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-500">Sort by</span>
          <select
            value={currentSort}
            onChange={(e) => push({ sortBy: e.target.value })}
            className={`${inputClass} min-w-[160px]`}
          >
            <option value="">Newest</option>
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {currentSort && (
        <button
          onClick={() => push({ sortDir: currentDir === "asc" ? "desc" : "asc" })}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/60"
          title="Toggle sort direction"
        >
          {currentDir === "asc" ? "↑ Asc" : "↓ Desc"}
        </button>
      )}

      {(params.get("q") || filters.some((f) => params.get(f.name)) || currentSort) && (
        <button
          onClick={() => router.push(pathname)}
          className="rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-slate-200"
        >
          Reset
        </button>
      )}
    </div>
  );
}
