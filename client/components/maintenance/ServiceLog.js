"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { apiMutate } from "@/lib/mutate";

// Maintenance status → the shared badge vocabulary.
function badgeStatus(status) {
  return status === "COMPLETED" ? "Completed" : "In Shop";
}

export default function ServiceLog({ records, canManage }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

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

  if (records.length === 0) {
    return <p className="text-sm text-slate-500">No service records yet.</p>;
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
          {error}
        </div>
      )}
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
            {records.map((r) => (
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
    </div>
  );
}
