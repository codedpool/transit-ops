import { getSession, getMaintenance, getMaintenanceOptions } from "@/lib/api";
import LogServiceForm from "@/components/maintenance/LogServiceForm";
import ServiceLog from "@/components/maintenance/ServiceLog";

export default async function MaintenancePage() {
  const session = await getSession();
  const canManage =
    Array.isArray(session?.permissions?.maintenance) &&
    session.permissions.maintenance.includes("create");

  const [records, options] = await Promise.all([
    getMaintenance(),
    canManage ? getMaintenanceOptions() : Promise.resolve({ vehicles: [] }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Maintenance</h1>
        <p className="text-sm text-slate-500">
          Service records and vehicle shop status.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {canManage && (
          <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Log Service Record
            </h2>
            <LogServiceForm vehicles={options.vehicles} />
          </section>
        )}

        <section
          className={`rounded-xl border border-slate-800 bg-slate-900/40 p-5 ${
            canManage ? "lg:col-span-2" : "lg:col-span-3"
          }`}
        >
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Service Log
          </h2>
          <ServiceLog records={records} canManage={canManage} />
        </section>
      </div>
    </div>
  );
}
