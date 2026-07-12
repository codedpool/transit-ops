"use client";

// Dashboard filter bar. URL-driven (like ListControls): changing a control pushes
// new searchParams, which re-runs the server component's data fetch — so the KPIs,
// vehicle-status bars and recent trips all re-scope on the server. Options are the
// regions / types actually present in the fleet, supplied by the dashboard endpoint.
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { titleize } from "@/lib/format";

function Select({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-[150px] rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 focus:border-amber-500/50 focus:outline-none"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-slate-900">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function FilterBar({ options = { regions: [], types: [] } }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function push(next) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (!v) sp.delete(k);
      else sp.set(k, v);
    }
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const type = params.get("type") || "";
  const region = params.get("region") || "";

  return (
    <div className="flex flex-wrap items-end gap-4">
      <Select
        label="Vehicle Type"
        value={type}
        onChange={(v) => push({ type: v })}
        options={options.types.map((t) => ({ value: t, label: titleize(t) }))}
      />
      <Select
        label="Region"
        value={region}
        onChange={(v) => push({ region: v })}
        options={options.regions.map((r) => ({ value: r, label: r }))}
      />
      {(type || region) && (
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
