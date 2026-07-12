"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { apiMutate } from "@/lib/mutate";

const TRIP_LABEL = {
  DRAFT: "Draft",
  DISPATCHED: "Dispatched",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};
const FILTERS = ["all", "DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"];
const INPUT =
  "w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none";

export default function TripBoard({ trips, canManage }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(null); // { id, type: 'complete' | 'cancel' }
  const [complete, setComplete] = useState({ finalOdometer: "", fuelConsumed: "" });
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const shown = trips.filter((t) => filter === "all" || t.status === filter);

  async function run(fn) {
    setError("");
    setBusy(true);
    try {
      await fn();
      setActive(null);
      setComplete({ finalOdometer: "", fuelConsumed: "" });
      setReason("");
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const dispatch = (id) => run(() => apiMutate(`/trips/${id}/dispatch`));
  const doComplete = (id) =>
    run(() =>
      apiMutate(`/trips/${id}/complete`, {
        body: {
          finalOdometer: Number(complete.finalOdometer),
          fuelConsumed: Number(complete.fuelConsumed),
        },
      })
    );
  const doCancel = (id) => run(() => apiMutate(`/trips/${id}/cancel`, { body: { reason } }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
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
            {f === "all" ? "All" : TRIP_LABEL[f]}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
          {error}
        </div>
      )}

      {shown.length === 0 && (
        <p className="text-sm text-slate-500">No trips for this filter.</p>
      )}

      <div className="space-y-3">
        {shown.map((t) => (
          <div key={t.id} className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-500">
                    TR{String(t.id).padStart(4, "0")}
                  </span>
                  <StatusBadge status={TRIP_LABEL[t.status] || t.status} />
                </div>
                <p className="mt-1 text-sm text-slate-200">
                  {t.source} → {t.destination}
                </p>
                <p className="text-xs text-slate-500">
                  {(t.vehicle && t.vehicle.nameOrModel) || "—"} ·{" "}
                  {(t.driver && t.driver.name) || "—"} · {t.cargoWeight} kg
                  {t.status === "CANCELLED" && t.cancellationReason
                    ? ` · ${t.cancellationReason}`
                    : ""}
                </p>
              </div>

              {canManage && (
                <div className="flex gap-2">
                  {t.status === "DRAFT" && (
                    <button
                      onClick={() => dispatch(t.id)}
                      disabled={busy}
                      className="rounded-lg bg-sky-500/15 px-3 py-1.5 text-xs font-medium text-sky-400 ring-1 ring-inset ring-sky-500/25 hover:bg-sky-500/25 disabled:opacity-50"
                    >
                      Dispatch
                    </button>
                  )}
                  {t.status === "DISPATCHED" && (
                    <button
                      onClick={() =>
                        setActive(active?.id === t.id && active.type === "complete" ? null : { id: t.id, type: "complete" })
                      }
                      disabled={busy}
                      className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/25 hover:bg-emerald-500/25 disabled:opacity-50"
                    >
                      Complete
                    </button>
                  )}
                  {(t.status === "DRAFT" || t.status === "DISPATCHED") && (
                    <button
                      onClick={() =>
                        setActive(active?.id === t.id && active.type === "cancel" ? null : { id: t.id, type: "cancel" })
                      }
                      disabled={busy}
                      className="rounded-lg border border-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-700 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}
            </div>

            {active?.id === t.id && active.type === "complete" && (
              <div className="mt-3 grid grid-cols-1 gap-2 border-t border-slate-800 pt-3 sm:grid-cols-3">
                <input
                  type="number"
                  className={INPUT}
                  placeholder="Final odometer"
                  value={complete.finalOdometer}
                  onChange={(e) => setComplete((c) => ({ ...c, finalOdometer: e.target.value }))}
                />
                <input
                  type="number"
                  className={INPUT}
                  placeholder="Fuel consumed (L)"
                  value={complete.fuelConsumed}
                  onChange={(e) => setComplete((c) => ({ ...c, fuelConsumed: e.target.value }))}
                />
                <button
                  onClick={() => doComplete(t.id)}
                  disabled={busy || !complete.finalOdometer || !complete.fuelConsumed}
                  className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                >
                  Confirm complete
                </button>
              </div>
            )}

            {active?.id === t.id && active.type === "cancel" && (
              <div className="mt-3 grid grid-cols-1 gap-2 border-t border-slate-800 pt-3 sm:grid-cols-[1fr_auto]">
                <input
                  className={INPUT}
                  placeholder="Cancellation reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <button
                  onClick={() => doCancel(t.id)}
                  disabled={busy || !reason.trim()}
                  className="rounded-lg bg-rose-500/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
                >
                  Confirm cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
