import { formatCurrency } from "@/lib/format";

// Operational cost per vehicle = Fuel + Maintenance + Expenses (computed server-side).
export default function CostSummary({ rows }) {
  const withCost = (rows || []).filter((r) => r.total > 0);
  const grand = withCost.reduce((s, r) => s + r.total, 0);

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Operational Cost by Vehicle
        </h2>
        <span className="text-sm text-slate-400">
          Fleet total <span className="font-semibold text-slate-100">{formatCurrency(grand)}</span>
        </span>
      </div>

      {withCost.length === 0 ? (
        <p className="text-sm text-slate-500">No costs recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="pb-3 font-medium">Vehicle</th>
                <th className="pb-3 text-right font-medium">Fuel</th>
                <th className="pb-3 text-right font-medium">Maintenance</th>
                <th className="pb-3 text-right font-medium">Expenses</th>
                <th className="pb-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {withCost.map((r) => (
                <tr key={r.vehicleId} className="text-slate-300">
                  <td className="py-2.5">
                    <span className="text-slate-200">{r.nameOrModel}</span>{" "}
                    <span className="font-mono text-xs text-slate-500">{r.registrationNumber}</span>
                  </td>
                  <td className="py-2.5 text-right tabular-nums">{formatCurrency(r.fuel)}</td>
                  <td className="py-2.5 text-right tabular-nums">{formatCurrency(r.maintenance)}</td>
                  <td className="py-2.5 text-right tabular-nums">{formatCurrency(r.expenses)}</td>
                  <td className="py-2.5 text-right font-semibold tabular-nums text-slate-100">
                    {formatCurrency(r.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
