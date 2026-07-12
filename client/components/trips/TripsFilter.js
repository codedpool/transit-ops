"use client";

// URL-driven status filter for the trip board. Pushing ?status=<enum> re-runs the
// server fetch (getTrips honors it) so the board narrows to a single lifecycle stage.
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const STATUSES = [
  { value: "", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function TripsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const status = params.get("status") || "";

  function set(value) {
    const sp = new URLSearchParams(params.toString());
    if (!value) sp.delete("status");
    else sp.set("status", value);
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUSES.map((s) => {
        const active = status === s.value;
        return (
          <button
            key={s.value || "all"}
            onClick={() => set(s.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "bg-amber-500/15 text-amber-400 ring-1 ring-inset ring-amber-500/25"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
