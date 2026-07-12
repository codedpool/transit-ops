// Minimal vertical bar chart (CSS, no charting dependency).
export default function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-40 items-end gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t bg-sky-500/70"
              style={{ height: `${(d.value / max) * 100}%` }}
              title={d.value.toLocaleString()}
            />
          </div>
          <span className="text-[10px] text-slate-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
