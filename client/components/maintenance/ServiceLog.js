"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { apiMutate } from "@/lib/mutate";

// Maintenance status → the shared badge vocabulary.
function badgeStatus(status) {
  return status === "COMPLETED" ? "Completed" : "In Shop";
}

const FILTERS = ["all", "OPEN", "IN_PROGRESS", "COMPLETED"];
const FILTER_LABEL = { all: "All", OPEN: "Open", IN_PROGRESS: "In Progress", COMPLETED: "Completed" };

export default function ServiceLog({ records, canManage }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const shown = records.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (q) {
      const hay = `${r.serviceType} ${r.vehicle ? r.vehicle.nameOrModel : ""}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  async function close(id) {
    setError("");
    setBusyId(id);
    try {
      await apiMutate(`/maintenance/${id}/close`);
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1 text-xs transition-colors ${
              filter === f
                ? "bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/25"
                : "text-slate-400 hover:bg-slate-800/60"
            }`}
          >
            {FILTER_LABEL[f]}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="ml-auto rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
          {error}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="text-sm text-slate-500">No service records for this filter.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="pb-3 font-medium">Vehicle</th>
                <th className="pb-3 font-medium">Service</th>
                <th className="pb-3 font-medium">Cost</th>
                <th className="pb-3 font-medium">Status</th>
                {canManage && <th className="pb-3 font-medium"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {shown.map((r) => (
                <tr key={r.id} className="text-slate-300">
                  <td className="py-3">{r.vehicle ? r.vehicle.nameOrModel : "—"}</td>
                  <td className="py-3">{r.serviceType}</td>
                  <td className="py-3 tabular-nums text-slate-400">
                    {r.cost != null ? r.cost.toLocaleString() : "—"}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={badgeStatus(r.status)} />
                  </td>
                  {canManage && (
                    <td className="py-3 text-right">
                      {r.status !== "COMPLETED" && (
                        <button
                          onClick={() => close(r.id)}
                          disabled={busyId === r.id}
                          className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/25 hover:bg-emerald-500/25 disabled:opacity-50"
                        >
                          {busyId === r.id ? "Closing…" : "Close"}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
