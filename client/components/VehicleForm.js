"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField, { inputClass } from "@/components/FormField";
import { VEHICLE_TYPES, VEHICLE_STATUSES } from "@/lib/permissions";
import { titleize } from "@/lib/format";
import { createVehicle, updateVehicle } from "@/lib/mutations";

const NUMERIC = ["maxLoadCapacity", "odometer", "acquisitionCost"];

export default function VehicleForm({ mode = "create", initial = null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    registrationNumber: initial?.registrationNumber || "",
    nameOrModel: initial?.nameOrModel || "",
    type: initial?.type || "VAN",
    maxLoadCapacity: initial?.maxLoadCapacity ?? "",
    odometer: initial?.odometer ?? "",
    acquisitionCost: initial?.acquisitionCost ?? "",
    status: initial?.status || "AVAILABLE",
    region: initial?.region || "",
  });
  const [errors, setErrors] = useState({});
  const [topError, setTopError] = useState("");
  const [busy, setBusy] = useState(false);

  function set(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setTopError("");

    // Coerce numeric fields to numbers (empty -> undefined so server defaults apply).
    const payload = { ...form };
    for (const k of NUMERIC) {
      payload[k] = payload[k] === "" ? undefined : Number(payload[k]);
    }
    if (payload.region === "") delete payload.region;

    try {
      if (mode === "edit") await updateVehicle(initial.id, payload);
      else await createVehicle(payload);
      router.push("/fleet");
      router.refresh();
    } catch (err) {
      if (err.details?.length) {
        const fe = {};
        for (const d of err.details) fe[d.field] = d.message;
        setErrors(fe);
      }
      setTopError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      {topError && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
          {topError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Registration Number" required error={errors.registrationNumber}>
          <input
            className={inputClass}
            value={form.registrationNumber}
            onChange={(e) => set("registrationNumber", e.target.value)}
            placeholder="GJ01AB1234"
          />
        </FormField>

        <FormField label="Name / Model" required error={errors.nameOrModel}>
          <input
            className={inputClass}
            value={form.nameOrModel}
            onChange={(e) => set("nameOrModel", e.target.value)}
            placeholder="TRUCK-11"
          />
        </FormField>

        <FormField label="Type" required error={errors.type}>
          <select className={inputClass} value={form.type} onChange={(e) => set("type", e.target.value)}>
            {VEHICLE_TYPES.map((t) => (
              <option key={t} value={t}>
                {titleize(t)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Status" required error={errors.status}>
          <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value)}>
            {VEHICLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleize(s)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Max Load Capacity (kg)" required error={errors.maxLoadCapacity}>
          <input
            type="number"
            step="any"
            min="0"
            className={inputClass}
            value={form.maxLoadCapacity}
            onChange={(e) => set("maxLoadCapacity", e.target.value)}
            placeholder="5000"
          />
        </FormField>

        <FormField label="Odometer (km)" error={errors.odometer}>
          <input
            type="number"
            step="any"
            min="0"
            className={inputClass}
            value={form.odometer}
            onChange={(e) => set("odometer", e.target.value)}
            placeholder="0"
          />
        </FormField>

        <FormField label="Acquisition Cost (₹)" error={errors.acquisitionCost}>
          <input
            type="number"
            step="any"
            min="0"
            className={inputClass}
            value={form.acquisitionCost}
            onChange={(e) => set("acquisitionCost", e.target.value)}
            placeholder="0"
          />
        </FormField>

        <FormField label="Region" error={errors.region}>
          <input
            className={inputClass}
            value={form.region}
            onChange={(e) => set("region", e.target.value)}
            placeholder="North"
          />
        </FormField>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-60"
        >
          {busy ? "Saving…" : mode === "edit" ? "Save Changes" : "Create Vehicle"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/fleet")}
          className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
