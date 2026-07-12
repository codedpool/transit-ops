const ACCENT = {
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
};

export default function KpiCard({ label, value, accent = "sky" }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div
        className={`absolute left-0 top-0 h-full w-1 ${ACCENT[accent] ?? ACCENT.sky}`}
      />
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-100">
        {value}
      </p>
    </div>
  );
}
