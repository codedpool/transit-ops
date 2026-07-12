import Link from "next/link";
import { getVehicles, getSession } from "@/lib/api";
import { can, VEHICLE_TYPES, VEHICLE_STATUSES } from "@/lib/permissions";
import { titleize, formatNumber, formatCurrency } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import ListControls from "@/components/ListControls";
import Pagination from "@/components/Pagination";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";

export const metadata = { title: "Fleet — TransitOps" };

export default async function FleetPage({ searchParams }) {
  const sp = await searchParams;
  const [session, result] = await Promise.all([getSession(), getVehicles(sp)]);
  const perms = session?.permissions;
  const canCreate = can(perms, "vehicles", "create");
  const canEdit = can(perms, "vehicles", "update");
  const canDelete = can(perms, "vehicles", "delete");

  const vehicles = result?.data || [];

  const filters = [
    { name: "status", label: "Status", options: VEHICLE_STATUSES.map((s) => ({ value: s, label: titleize(s) })) },
    { name: "type", label: "Type", options: VEHICLE_TYPES.map((t) => ({ value: t, label: titleize(t) })) },
  ];
  const sorts = [
    { value: "registrationNumber", label: "Registration" },
    { value: "nameOrModel", label: "Name / Model" },
    { value: "odometer", label: "Odometer" },
    { value: "acquisitionCost", label: "Acquisition Cost" },
    { value: "status", label: "Status" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Fleet</h1>
          <p className="text-sm text-slate-500">Vehicle registry — {result?.pagination?.total ?? 0} vehicles.</p>
        </div>
        {canCreate && (
          <Link
            href="/fleet/new"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
          >
            + New Vehicle
          </Link>
        )}
      </div>

      <ListControls filters={filters} sorts={sorts} searchPlaceholder="Registration or model…" />

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-[11px] uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3 font-medium">Registration</th>
              <th className="px-4 py-3 font-medium">Name / Model</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Capacity</th>
              <th className="px-4 py-3 font-medium">Odometer</th>
              <th className="px-4 py-3 font-medium">Acq. Cost</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No vehicles match your filters.
                </td>
              </tr>
            )}
            {vehicles.map((v) => (
              <tr key={v.id} className="text-slate-300 hover:bg-slate-800/30">
                <td className="px-4 py-3 font-mono text-slate-200">{v.registrationNumber}</td>
                <td className="px-4 py-3">{v.nameOrModel}</td>
                <td className="px-4 py-3">{titleize(v.type)}</td>
                <td className="px-4 py-3 tabular-nums">{formatNumber(v.maxLoadCapacity, "kg")}</td>
                <td className="px-4 py-3 tabular-nums">{formatNumber(v.odometer, "km")}</td>
                <td className="px-4 py-3 tabular-nums">{formatCurrency(v.acquisitionCost)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={titleize(v.status)} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/fleet/${v.id}`} className="text-xs text-sky-400 hover:text-sky-300">
                      View
                    </Link>
                    {canEdit && (
                      <Link href={`/fleet/${v.id}/edit`} className="text-xs text-slate-300 hover:text-slate-100">
                        Edit
                      </Link>
                    )}
                    {canDelete && <ConfirmDeleteButton entity="vehicle" id={v.id} small />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination pagination={result?.pagination} />
    </div>
  );
}
