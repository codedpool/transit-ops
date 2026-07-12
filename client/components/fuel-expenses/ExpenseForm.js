"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField, { inputClass } from "@/components/FormField";
import { EXPENSE_CATEGORIES } from "@/lib/permissions";
import { titleize } from "@/lib/format";
import { createExpense } from "@/lib/mutations";

const today = () => new Date().toISOString().slice(0, 10);

export default function ExpenseForm({ vehicles, trips }) {
  const router = useRouter();
  const [form, setForm] = useState({
    vehicleId: "",
    category: "TOLL",
    amount: "",
    date: today(),
    notes: "",
    relatedTripId: "",
  });
  const [errors, setErrors] = useState({});
  const [topError, setTopError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setTopError("");
    try {
      await createExpense({
        vehicleId: Number(form.vehicleId),
        category: form.category,
        amount: Number(form.amount),
        date: form.date,
        notes: form.notes || undefined,
        relatedTripId: form.relatedTripId || undefined,
      });
      setForm({ vehicleId: "", category: "TOLL", amount: "", date: today(), notes: "", relatedTripId: "" });
      router.refresh();
    } catch (err) {
      if (err.details?.length) {
        const fe = {};
        for (const d of err.details) fe[d.field] = d.message;
        setErrors(fe);
      }
      setTopError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {topError && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
          {topError}
        </div>
      )}
      <FormField label="Vehicle" required error={errors.vehicleId}>
        <select className={inputClass} value={form.vehicleId} onChange={(e) => set("vehicleId", e.target.value)}>
          <option value="">Select vehicle…</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nameOrModel} ({v.registrationNumber})
            </option>
          ))}
        </select>
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Category" required error={errors.category}>
          <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {titleize(c)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Amount (₹)" required error={errors.amount}>
          <input type="number" step="any" min="0" className={inputClass} value={form.amount} onChange={(e) => set("amount", e.target.value)} />
        </FormField>
      </div>
      <FormField label="Date" required error={errors.date}>
        <input type="date" className={inputClass} value={form.date} onChange={(e) => set("date", e.target.value)} />
      </FormField>
      <FormField label="Notes (optional)" error={errors.notes}>
        <input className={inputClass} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="e.g. Expressway toll" />
      </FormField>
      <FormField label="Related Trip (optional)" error={errors.relatedTripId}>
        <select className={inputClass} value={form.relatedTripId} onChange={(e) => set("relatedTripId", e.target.value)}>
          <option value="">— none —</option>
          {trips.map((t) => (
            <option key={t.id} value={t.id}>
              TR{String(t.id).padStart(4, "0")}: {t.source} → {t.destination}
            </option>
          ))}
        </select>
      </FormField>
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-60"
      >
        {busy ? "Saving…" : "Add Expense"}
      </button>
    </form>
  );
}
