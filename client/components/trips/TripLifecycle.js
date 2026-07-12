const STAGES = [
  { label: "Draft", dot: "bg-slate-500" },
  { label: "Dispatched", dot: "bg-sky-500" },
  { label: "Completed", dot: "bg-emerald-500" },
  { label: "Cancelled", dot: "bg-rose-500" },
];

export default function TripLifecycle() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
      {STAGES.map((s, i) => (
        <div key={s.label} className="flex items-center gap-3">
          <span className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
            {s.label}
          </span>
          {i < STAGES.length - 1 && <span className="h-px w-6 bg-slate-700" />}
        </div>
      ))}
    </div>
  );
}
