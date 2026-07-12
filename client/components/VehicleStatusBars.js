const BAR = {
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
};

export default function VehicleStatusBars({ items }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-3">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-3">
          <span className="w-20 shrink-0 text-sm text-slate-400">{i.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full ${BAR[i.color] ?? BAR.sky}`}
              style={{ width: `${(i.value / max) * 100}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-sm tabular-nums text-slate-300">
            {i.value}
          </span>
        </div>
      ))}
    </div>
  );
}
