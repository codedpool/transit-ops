"use client";

// Delete control with a confirm step. Takes serializable props (entity + id) so
// it can be rendered from Server Components; it resolves the right mutation itself.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteVehicle, deleteDriver, deleteFuelLog, deleteExpense } from "@/lib/mutations";

const DELETERS = {
  vehicle: deleteVehicle,
  driver: deleteDriver,
  fuel: deleteFuelLog,
  expense: deleteExpense,
};

export default function ConfirmDeleteButton({ entity, id, label = "Delete", redirectTo, small }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handle() {
    if (!window.confirm("Delete this record? This cannot be undone.")) return;
    setBusy(true);
    setError("");
    try {
      await DELETERS[entity](id);
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const cls = small
    ? "text-xs text-rose-400 hover:text-rose-300 disabled:opacity-50"
    : "rounded-lg border border-rose-500/30 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 disabled:opacity-50";

  return (
    <span className="inline-flex items-center gap-2">
      <button onClick={handle} disabled={busy} className={cls}>
        {busy ? "Deleting…" : label}
      </button>
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </span>
  );
}
