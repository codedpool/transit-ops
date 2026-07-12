import Link from "next/link";
import { notFound } from "next/navigation";
import { getVehicle, getSession, getVehicleDocuments } from "@/lib/api";
import { can } from "@/lib/permissions";
import { titleize, formatNumber, formatCurrency, formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import VehicleDocuments from "@/components/VehicleDocuments";

export const metadata = { title: "Vehicle — TransitOps" };

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-800 py-3 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm text-slate-200">{children}</span>
    </div>
  );
}

export default async function VehicleDetailPage({ params }) {
  const { id } = await params;
  const [session, vehicle, documents] = await Promise.all([
    getSession(),
    getVehicle(id),
    getVehicleDocuments(id),
  ]);
  if (!vehicle) notFound();

  const perms = session?.permissions;
  const canEdit = can(perms, "vehicles", "update");
  const canDelete = can(perms, "vehicles", "delete");

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/fleet" className="text-sm text-slate-500 hover:text-slate-300">
            ← Fleet
          </Link>
          <h1 className="mt-1 flex items-center gap-3 text-xl font-semibold text-slate-100">
            <span className="font-mono">{vehicle.registrationNumber}</span>
            <StatusBadge status={titleize(vehicle.status)} />
          </h1>
          <p className="text-sm text-slate-500">{vehicle.nameOrModel}</p>
        </div>
        <div className="flex items-center gap-3">
          {canEdit && (
            <Link
              href={`/fleet/${vehicle.id}/edit`}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/60"
            >
              Edit
            </Link>
          )}
          {canDelete && <ConfirmDeleteButton entity="vehicle" id={vehicle.id} redirectTo="/fleet" />}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-5 py-2">
        <Row label="Registration Number">{vehicle.registrationNumber}</Row>
        <Row label="Name / Model">{vehicle.nameOrModel}</Row>
        <Row label="Type">{titleize(vehicle.type)}</Row>
        <Row label="Max Load Capacity">{formatNumber(vehicle.maxLoadCapacity, "kg")}</Row>
        <Row label="Odometer">{formatNumber(vehicle.odometer, "km")}</Row>
        <Row label="Acquisition Cost">{formatCurrency(vehicle.acquisitionCost)}</Row>
        <Row label="Status">{titleize(vehicle.status)}</Row>
        <Row label="Region">{vehicle.region || "—"}</Row>
        <Row label="Added">{formatDate(vehicle.createdAt)}</Row>
      </div>

      <VehicleDocuments vehicleId={vehicle.id} documents={documents} canManage={canEdit} />
    </div>
  );
}
