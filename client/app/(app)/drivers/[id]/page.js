import Link from "next/link";
import { notFound } from "next/navigation";
import { getDriver, getSession } from "@/lib/api";
import { can } from "@/lib/permissions";
import { titleize, formatNumber, formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import LicenseBadge from "@/components/LicenseBadge";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";

export const metadata = { title: "Driver — TransitOps" };

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-800 py-3 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm text-slate-200">{children}</span>
    </div>
  );
}

export default async function DriverDetailPage({ params }) {
  const { id } = await params;
  const [session, driver] = await Promise.all([getSession(), getDriver(id)]);
  if (!driver) notFound();

  const perms = session?.permissions;
  const canEdit = can(perms, "drivers", "update");
  const canDelete = can(perms, "drivers", "delete");

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/drivers" className="text-sm text-slate-500 hover:text-slate-300">
            ← Drivers
          </Link>
          <h1 className="mt-1 flex items-center gap-3 text-xl font-semibold text-slate-100">
            {driver.name}
            <StatusBadge status={titleize(driver.status)} />
          </h1>
          <p className="font-mono text-sm text-slate-500">{driver.licenseNumber}</p>
        </div>
        <div className="flex items-center gap-3">
          {canEdit && (
            <Link
              href={`/drivers/${driver.id}/edit`}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/60"
            >
              Edit
            </Link>
          )}
          {canDelete && <ConfirmDeleteButton entity="driver" id={driver.id} redirectTo="/drivers" />}
        </div>
      </div>

      {(driver.licenseExpired || driver.licenseExpiringSoon) && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            driver.licenseExpired
              ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
              : "border-amber-500/30 bg-amber-500/10 text-amber-400"
          }`}
        >
          {driver.licenseExpired
            ? "⚠ This driver's license has expired — they cannot be assigned to trips."
            : "⚠ This driver's license is expiring soon."}
        </div>
      )}

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-5 py-2">
        <Row label="Name">{driver.name}</Row>
        <Row label="License Number">{driver.licenseNumber}</Row>
        <Row label="License Category">{driver.licenseCategory}</Row>
        <Row label="License Expiry">
          <LicenseBadge
            expiryDate={driver.licenseExpiryDate}
            expired={driver.licenseExpired}
            expiringSoon={driver.licenseExpiringSoon}
          />
        </Row>
        <Row label="Contact Number">{driver.contactNumber}</Row>
        <Row label="Safety Score">{formatNumber(driver.safetyScore)}</Row>
        <Row label="Status">{titleize(driver.status)}</Row>
        <Row label="Region">{driver.region || "—"}</Row>
        <Row label="Added">{formatDate(driver.createdAt)}</Row>
      </div>
    </div>
  );
}
