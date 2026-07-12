import { getSession, getTrips, getTripOptions } from "@/lib/api";
import TripLifecycle from "@/components/trips/TripLifecycle";
import CreateTripForm from "@/components/trips/CreateTripForm";
import TripBoard from "@/components/trips/TripBoard";

export default async function TripsPage() {
  const session = await getSession();
  const canManage =
    Array.isArray(session?.permissions?.trips) &&
    session.permissions.trips.includes("create");

  const [trips, options] = await Promise.all([
    getTrips(),
    canManage ? getTripOptions() : Promise.resolve({ vehicles: [], drivers: [] }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Trips</h1>
        <p className="text-sm text-slate-500">Dispatch board and trip lifecycle.</p>
      </div>

      <TripLifecycle />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {canManage && (
          <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Create Trip
            </h2>
            <CreateTripForm vehicles={options.vehicles} drivers={options.drivers} />
          </section>
        )}

        <section
          className={`rounded-xl border border-slate-800 bg-slate-900/40 p-5 ${
            canManage ? "lg:col-span-2" : "lg:col-span-3"
          }`}
        >
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Live Board
          </h2>
          <TripBoard trips={trips} canManage={canManage} />
        </section>
      </div>
    </div>
  );
}
