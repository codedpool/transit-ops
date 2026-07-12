"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiMutate } from "@/lib/mutate";

const INPUT =
  "w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none";
const LABEL = "text-[11px] uppercase tracking-wider text-slate-500";
const EMPTY = {
  source: "",
  destination: "",
  vehicleId: "",
  driverId: "",
  cargoWeight: "",
  plannedDistance: "",
};

export default function CreateTripForm({ vehicles, drivers }) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => String(v.id) === String(form.vehicleId)),
    [vehicles, form.vehicleId]
  );
  const capacity = selectedVehicle ? Number(selectedVehicle.maxLoadCapacity) : null;
  const cargo = form.cargoWeight === "" ? null : Number(form.cargoWeight);
  const overCapacity = capacity != null && cargo != null && cargo > capacity;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const canSubmit =
    form.source &&
    form.destination &&
    form.vehicleId &&
    form.driverId &&
    cargo != null &&
    cargo > 0 &&
    !overCapacity &&
    !busy;

  async function submit(dispatchAfter) {
    setError("");
    setBusy(true);
    try {
      const { data: trip } = await apiMutate("/trips", {
        body: {
          source: form.source,
          destination: form.destination,
          vehicleId: Number(form.vehicleId),
          driverId: Number(form.driverId),
          cargoWeight: Number(form.cargoWeight),
          plannedDistance: Number(form.plannedDistance || 0),
        },
      });
      if (dispatchAfter) await apiMutate(`/trips/${trip.id}/dispatch`);
      setForm(EMPTY);
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit(true);
      }}
    >
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className={LABEL}>Source</label>
        <input className={INPUT} value={form.source} onChange={set("source")} placeholder="Gandhinagar Depot" />
      </div>
      <div className="space-y-1">
        <label className={LABEL}>Destination</label>
        <input className={INPUT} value={form.destination} onChange={set("destination")} placeholder="Ahmedabad Hub" />
      </div>

      <div className="space-y-1">
        <label className={LABEL}>Vehicle (available only)</label>
        <select className={INPUT} value={form.vehicleId} onChange={set("vehicleId")}>
          <option value="">Select vehicle…</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id} className="bg-slate-900">
              {v.nameOrModel} — {v.maxLoadCapacity} kg
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className={LABEL}>Driver (available only)</label>
        <select className={INPUT} value={form.driverId} onChange={set("driverId")}>
          <option value="">Select driver…</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id} className="bg-slate-900">
              {d.name} — {d.licenseCategory}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={LABEL}>Cargo Weight (kg)</label>
          <input type="number" min="0" className={INPUT} value={form.cargoWeight} onChange={set("cargoWeight")} placeholder="450" />
        </div>
        <div className="space-y-1">
          <label className={LABEL}>Planned Distance (km)</label>
          <input type="number" min="0" className={INPUT} value={form.plannedDistance} onChange={set("plannedDistance")} placeholder="38" />
        </div>
      </div>

      {selectedVehicle && (
        <div
          className={`rounded-lg border px-3 py-2 text-xs ${
            overCapacity
              ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
              : "border-slate-800 bg-slate-900/40 text-slate-400"
          }`}
        >
          Vehicle capacity: {capacity} kg · Cargo: {cargo ?? 0} kg
          {overCapacity && (
            <div className="mt-1 font-medium">
              Capacity exceeded by {cargo - capacity} kg — dispatch blocked.
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Working…" : "Create & Dispatch"}
        </button>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => submit(false)}
          className="rounded-lg border border-slate-800 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save Draft
        </button>
      </div>

      {vehicles.length === 0 && (
        <p className="text-xs text-slate-500">No available vehicles to dispatch.</p>
      )}
      {drivers.length === 0 && (
        <p className="text-xs text-slate-500">No available drivers to assign.</p>
      )}
    </form>
  );
}
