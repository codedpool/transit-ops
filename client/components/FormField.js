// Shared form primitives so every form looks and behaves the same.
export const inputClass =
  "w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none";

export const labelClass = "text-[11px] uppercase tracking-wider text-slate-500";

export default function FormField({ label, required, error, hint, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className={labelClass}>
        {label}
        {required && <span className="text-rose-400"> *</span>}
      </span>
      {children}
      {hint && !error && <span className="text-xs text-slate-500">{hint}</span>}
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </label>
  );
}
