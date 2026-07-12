// Stat readout. The figure is set in the condensed display face (big, confident
// signage numerals); the label is a quiet, readable title-case caption. A short
// signal tick keys the metric to its status colour.
const ACCENT = {
  sky: "bg-sky-400",
  emerald: "bg-emerald-400",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
};

export default function KpiCard({ label, value, accent = "sky" }) {
  return (
    <div className="flex min-h-[112px] flex-col justify-between rounded-md border border-slate-800 bg-slate-900 px-4 py-4">
      <p className="text-[13px] font-medium leading-snug text-slate-400">{label}</p>
      <div>
        <p className="font-display text-[38px] font-bold leading-none tracking-tight text-slate-100 tabular-nums">
          {value}
        </p>
        <span className={`mt-2.5 block h-[3px] w-7 rounded-full ${ACCENT[accent] ?? ACCENT.sky}`} />
      </div>
    </div>
  );
}
