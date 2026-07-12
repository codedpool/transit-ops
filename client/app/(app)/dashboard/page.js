import FilterBar from "@/components/FilterBar";
import KpiCard from "@/components/KpiCard";
import RecentTripsTable from "@/components/RecentTripsTable";
import VehicleStatusBars from "@/components/VehicleStatusBars";
import { getDashboardSummary } from "@/lib/api";
import {
  kpis as fallbackKpis,
  recentTrips as fallbackTrips,
  vehicleStatus as fallbackStatus,
} from "@/lib/placeholderData";

export default async function DashboardPage() {
  let data;
  let live = true;
  try {
    data = await getDashboardSummary();
  } catch {
    live = false;
    data = {
      kpis: fallbackKpis,
      recentTrips: fallbackTrips,
      vehicleStatus: fallbackStatus,
    };
  }

  const { kpis, recentTrips, vehicleStatus } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Fleet overview and live operations.
          </p>
        </div>
        {!live && (
          <span className="rounded-md bg-amber-500/15 px-2.5 py-1 text-xs text-amber-400 ring-1 ring-inset ring-amber-500/25">
            Backend offline — showing sample data
          </span>
        )}
      </div>

      <FilterBar />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {kpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} accent={k.accent} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 lg:col-span-2">
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Recent Trips
          </h2>
          <RecentTripsTable trips={recentTrips} />
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Vehicle Status
          </h2>
          <VehicleStatusBars items={vehicleStatus} />
        </section>
      </div>
    </div>
  );
}
