import { getAnalytics } from "@/lib/api";
import KpiCard from "@/components/KpiCard";
import BarChart from "@/components/analytics/BarChart";
import RankBars from "@/components/analytics/RankBars";
import ExportCsvButton from "@/components/analytics/ExportCsvButton";
import ExportPdfButton from "@/components/analytics/ExportPdfButton";

export default async function AnalyticsPage() {
  const data = await getAnalytics();

  if (!data) {
    return (
      <div className="text-sm text-slate-400">
        Analytics unavailable — is the backend running?
      </div>
    );
  }

  const { kpis, monthlyRevenue, topCostliest, vehicles } = data;
  const cards = [
    { label: "Fuel Efficiency", value: `${kpis.fuelEfficiency} km/L`, accent: "emerald" },
    { label: "Fleet Utilization", value: `${kpis.fleetUtilization}%`, accent: "sky" },
    { label: "Operational Cost", value: kpis.operationalCost.toLocaleString(), accent: "amber" },
    { label: "Vehicle ROI", value: `${kpis.vehicleRoi}%`, accent: "emerald" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Analytics</h1>
          <p className="text-sm text-slate-500">
            ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost
          </p>
        </div>
        <div className="flex gap-2">
          <ExportCsvButton />
          <ExportPdfButton />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <KpiCard key={c.label} label={c.label} value={c.value} accent={c.accent} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Monthly Revenue
          </h2>
          {monthlyRevenue.length ? (
            <BarChart data={monthlyRevenue.map((m) => ({ label: m.month.slice(2), value: m.revenue }))} />
          ) : (
            <p className="text-sm text-slate-500">No completed trips yet.</p>
          )}
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Top Costliest Vehicles
          </h2>
          {topCostliest.length ? (
            <RankBars items={topCostliest.map((t) => ({ label: t.name, value: t.operationalCost }))} />
          ) : (
            <p className="text-sm text-slate-500">No cost data yet.</p>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Per-Vehicle Breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="pb-3 font-medium">Vehicle</th>
                <th className="pb-3 font-medium">Revenue</th>
                <th className="pb-3 font-medium">Op. Cost</th>
                <th className="pb-3 font-medium">Profit</th>
                <th className="pb-3 font-medium">ROI</th>
                <th className="pb-3 font-medium">km/L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {vehicles.map((v) => (
                <tr key={v.id} className="text-slate-300">
                  <td className="py-3">{v.nameOrModel}</td>
                  <td className="py-3 tabular-nums text-slate-400">{v.revenue.toLocaleString()}</td>
                  <td className="py-3 tabular-nums text-slate-400">{v.operationalCost.toLocaleString()}</td>
                  <td className={`py-3 tabular-nums ${v.profitability >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {v.profitability.toLocaleString()}
                  </td>
                  <td className="py-3 tabular-nums text-slate-400">{v.roi}%</td>
                  <td className="py-3 tabular-nums text-slate-400">{v.fuelEfficiency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
