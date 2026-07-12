"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDocument, deleteDocument } from "@/lib/mutations";

const INPUT =
  "w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none";
const EMPTY = { title: "", docType: "", referenceNumber: "", expiryDate: "", fileUrl: "" };

export default function VehicleDocuments({ vehicleId, documents, canManage }) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await createDocument({
        vehicleId,
        title: form.title,
        docType: form.docType,
        referenceNumber: form.referenceNumber || undefined,
        expiryDate: form.expiryDate || undefined,
        fileUrl: form.fileUrl || undefined,
      });
      setForm(EMPTY);
      setAdding(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    setBusy(true);
    try {
      await deleteDocument(id);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Documents
        </h2>
        {canManage && (
          <button
            onClick={() => setAdding((a) => !a)}
            className="text-xs text-amber-400 hover:text-amber-300"
          >
            {adding ? "Cancel" : "+ Add"}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
          {error}
        </div>
      )}

      {adding && canManage && (
        <form onSubmit={submit} className="mb-4 space-y-2">
          <input className={INPUT} placeholder="Title (e.g. Insurance policy)" value={form.title} onChange={set("title")} />
          <input className={INPUT} placeholder="Type (e.g. Insurance, RC, PUC)" value={form.docType} onChange={set("docType")} />
          <div className="grid grid-cols-2 gap-2">
            <input className={INPUT} placeholder="Reference no. (optional)" value={form.referenceNumber} onChange={set("referenceNumber")} />
            <input type="date" className={INPUT} value={form.expiryDate} onChange={set("expiryDate")} />
          </div>
          <input className={INPUT} placeholder="Link URL (optional)" value={form.fileUrl} onChange={set("fileUrl")} />
          <button
            type="submit"
            disabled={busy || !form.title || !form.docType}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save document"}
          </button>
        </form>
      )}

      {documents.length === 0 ? (
        <p className="text-sm text-slate-500">No documents.</p>
      ) : (
        <ul className="divide-y divide-slate-800">
          {documents.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm text-slate-200">
                  {d.title} <span className="text-slate-500">· {d.docType}</span>
                </p>
                <p className="text-xs text-slate-500">
                  {d.referenceNumber ? `Ref ${d.referenceNumber}` : ""}
                  {d.expiryDate ? ` · Expires ${new Date(d.expiryDate).toLocaleDateString()}` : ""}
                  {d.fileUrl ? " · " : ""}
                  {d.fileUrl ? (
                    <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                      link
                    </a>
                  ) : null}
                </p>
              </div>
              {canManage && (
                <button
                  onClick={() => remove(d.id)}
                  disabled={busy}
                  className="text-xs text-slate-500 hover:text-rose-400 disabled:opacity-50"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
