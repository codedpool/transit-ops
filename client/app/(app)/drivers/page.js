import Link from "next/link";
import { getDrivers, getSession } from "@/lib/api";
import { can, DRIVER_STATUSES } from "@/lib/permissions";
import { titleize, formatNumber } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import LicenseBadge from "@/components/LicenseBadge";
import ListControls from "@/components/ListControls";
import Pagination from "@/components/Pagination";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";

export const metadata = { title: "Drivers — TransitOps" };

export default async function DriversPage({ searchParams }) {
  const sp = await searchParams;
  const [session, result] = await Promise.all([getSession(), getDrivers(sp)]);
  const perms = session?.permissions;
  const canCreate = can(perms, "drivers", "create");
  const canEdit = can(perms, "drivers", "update");
  const canDelete = can(perms, "drivers", "delete");

  const drivers = result?.data || [];

  const filters = [
    { name: "status", label: "Status", options: DRIVER_STATUSES.map((s) => ({ value: s, label: titleize(s) })) },
    {
      name: "license",
      label: "License",
      options: [
        { value: "expired", label: "Expired" },
        { value: "expiring", label: "Expiring soon" },
      ],
    },
  ];
  const sorts = [
    { value: "name", label: "Name" },
    { value: "licenseNumber", label: "License No." },
    { value: "licenseExpiryDate", label: "License Expiry" },
    { value: "safetyScore", label: "Safety Score" },
    { value: "status", label: "Status" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Drivers</h1>
          <p className="text-sm text-slate-500">Driver management — {result?.pagination?.total ?? 0} drivers.</p>
        </div>
        {canCreate && (
          <Link
            href="/drivers/new"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
          >
            + New Driver
          </Link>
        )}
      </div>

      <ListControls filters={filters} sorts={sorts} searchPlaceholder="Name or license no.…" />

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-[11px] uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">License No.</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">License Expiry</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Safety</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {drivers.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No drivers match your filters.
                </td>
              </tr>
            )}
            {drivers.map((d) => (
              <tr key={d.id} className="text-slate-300 hover:bg-slate-800/30">
                <td className="px-4 py-3 text-slate-200">{d.name}</td>
                <td className="px-4 py-3 font-mono">{d.licenseNumber}</td>
                <td className="px-4 py-3">{d.licenseCategory}</td>
                <td className="px-4 py-3">
                  <LicenseBadge
                    expiryDate={d.licenseExpiryDate}
                    expired={d.licenseExpired}
                    expiringSoon={d.licenseExpiringSoon}
                  />
                </td>
                <td className="px-4 py-3 tabular-nums">{d.contactNumber}</td>
                <td className="px-4 py-3 tabular-nums">{formatNumber(d.safetyScore)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={titleize(d.status)} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/drivers/${d.id}`} className="text-xs text-sky-400 hover:text-sky-300">
                      View
                    </Link>
                    {canEdit && (
                      <Link href={`/drivers/${d.id}/edit`} className="text-xs text-slate-300 hover:text-slate-100">
                        Edit
                      </Link>
                    )}
                    {canDelete && <ConfirmDeleteButton entity="driver" id={d.id} small />}
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
