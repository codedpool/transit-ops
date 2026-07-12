// Horizontal ranked bars (CSS, no charting dependency).
const COLORS = ["bg-rose-500", "bg-amber-500", "bg-sky-500", "bg-emerald-500", "bg-slate-500"];

export default function RankBars({ items }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-3">
      {items.map((i, idx) => (
        <div key={i.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-sm text-slate-400">{i.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full ${COLORS[idx % COLORS.length]}`}
              style={{ width: `${(i.value / max) * 100}%` }}
            />
          </div>
          <span className="w-20 shrink-0 text-right text-sm tabular-nums text-slate-300">
            {i.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
