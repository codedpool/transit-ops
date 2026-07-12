"use client";

import { API_BASE } from "@/lib/config";

export default function ExportCsvButton() {
  async function download() {
    try {
      const res = await fetch(`${API_BASE}/reports/export.csv`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transitops-report.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={download}
      className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400"
    >
      Export CSV
    </button>
  );
}
