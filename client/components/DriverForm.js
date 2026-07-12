"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField, { inputClass } from "@/components/FormField";
import { DRIVER_STATUSES } from "@/lib/permissions";
import { titleize, toDateInput } from "@/lib/format";
import { createDriver, updateDriver } from "@/lib/mutations";

export default function DriverForm({ mode = "create", initial = null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial?.name || "",
    licenseNumber: initial?.licenseNumber || "",
    licenseCategory: initial?.licenseCategory || "",
    licenseExpiryDate: toDateInput(initial?.licenseExpiryDate),
    contactNumber: initial?.contactNumber || "",
    safetyScore: initial?.safetyScore ?? 100,
    status: initial?.status || "AVAILABLE",
    region: initial?.region || "",
  });
  const [errors, setErrors] = useState({});
  const [topError, setTopError] = useState("");
  const [busy, setBusy] = useState(false);

  function set(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  // Live warning if the chosen expiry date is in the past.
  const expiryPast =
    form.licenseExpiryDate && new Date(form.licenseExpiryDate) < new Date(new Date().toDateString());

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setTopError("");

    const payload = { ...form, safetyScore: Number(form.safetyScore) };
    if (payload.region === "") delete payload.region;

    try {
      if (mode === "edit") await updateDriver(initial.id, payload);
      else await createDriver(payload);
      router.push("/drivers");
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
        <FormField label="Name" required error={errors.name}>
          <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Alex Kumar" />
        </FormField>

        <FormField label="License Number" required error={errors.licenseNumber}>
          <input className={inputClass} value={form.licenseNumber} onChange={(e) => set("licenseNumber", e.target.value)} placeholder="DL-88213" />
        </FormField>

        <FormField label="License Category" required error={errors.licenseCategory}>
          <input className={inputClass} value={form.licenseCategory} onChange={(e) => set("licenseCategory", e.target.value)} placeholder="LMV / HMV" />
        </FormField>

        <FormField
          label="License Expiry Date"
          required
          error={errors.licenseExpiryDate}
          hint={expiryPast ? undefined : "Used to flag expired / expiring licenses."}
        >
          <input
            type="date"
            className={inputClass}
            value={form.licenseExpiryDate}
            onChange={(e) => set("licenseExpiryDate", e.target.value)}
          />
          {expiryPast && (
            <span className="text-xs text-rose-400">⚠ This license is already expired.</span>
          )}
        </FormField>

        <FormField label="Contact Number" required error={errors.contactNumber}>
          <input className={inputClass} value={form.contactNumber} onChange={(e) => set("contactNumber", e.target.value)} placeholder="98765 43210" />
        </FormField>

        <FormField label="Safety Score (0–100)" error={errors.safetyScore}>
          <input
            type="number"
            min="0"
            max="100"
            step="any"
            className={inputClass}
            value={form.safetyScore}
            onChange={(e) => set("safetyScore", e.target.value)}
          />
        </FormField>

        <FormField label="Status" required error={errors.status}>
          <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value)}>
            {DRIVER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleize(s)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Region" error={errors.region}>
          <input className={inputClass} value={form.region} onChange={(e) => set("region", e.target.value)} placeholder="North" />
        </FormField>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-60"
        >
          {busy ? "Saving…" : mode === "edit" ? "Save Changes" : "Create Driver"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/drivers")}
          className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
