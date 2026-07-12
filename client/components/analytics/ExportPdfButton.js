"use client";

import { API_BASE } from "@/lib/config";

export default function ExportPdfButton() {
  async function download() {
    try {
      const res = await fetch(`${API_BASE}/reports/export.pdf`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transitops-report.pdf";
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
      className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800/60"
    >
      Export PDF
    </button>
  );
}
