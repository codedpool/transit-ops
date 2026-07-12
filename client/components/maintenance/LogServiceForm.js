"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiMutate } from "@/lib/mutate";

const INPUT =
  "w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none";
const LABEL = "text-[11px] uppercase tracking-wider text-slate-500";
const EMPTY = { vehicleId: "", serviceType: "", cost: "", status: "OPEN", issueNotes: "" };

export default function LogServiceForm({ vehicles }) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canSubmit = form.vehicleId && form.serviceType && !busy;

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await apiMutate("/maintenance", {
        body: {
          vehicleId: Number(form.vehicleId),
          serviceType: form.serviceType,
          cost: form.cost === "" ? undefined : Number(form.cost),
          status: form.status,
          issueNotes: form.issueNotes || undefined,
        },
      });
      setForm(EMPTY);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className={LABEL}>Vehicle</label>
        <select className={INPUT} value={form.vehicleId} onChange={set("vehicleId")}>
          <option value="">Select vehicle…</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id} className="bg-slate-900">
              {v.nameOrModel} ({v.status === "IN_SHOP" ? "In Shop" : "Available"})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className={LABEL}>Service Type</label>
        <input className={INPUT} value={form.serviceType} onChange={set("serviceType")} placeholder="Oil Change" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={LABEL}>Cost</label>
          <input type="number" min="0" className={INPUT} value={form.cost} onChange={set("cost")} placeholder="2500" />
        </div>
        <div className="space-y-1">
          <label className={LABEL}>Status</label>
          <select className={INPUT} value={form.status} onChange={set("status")}>
            <option value="OPEN" className="bg-slate-900">Open</option>
            <option value="IN_PROGRESS" className="bg-slate-900">In Progress</option>
            <option value="COMPLETED" className="bg-slate-900">Completed</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className={LABEL}>Issue Notes</label>
        <input className={INPUT} value={form.issueNotes} onChange={set("issueNotes")} placeholder="Optional" />
      </div>

      <p className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-slate-500">
        Logging an active record moves the vehicle to <span className="text-amber-400">In Shop</span> and hides it from dispatch.
      </p>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save"}
      </button>

      {vehicles.length === 0 && (
        <p className="text-xs text-slate-500">No serviceable vehicles.</p>
      )}
    </form>
  );
}
