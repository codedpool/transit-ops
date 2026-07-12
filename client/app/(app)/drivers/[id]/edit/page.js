import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getDriver, getSession } from "@/lib/api";
import { can } from "@/lib/permissions";
import DriverForm from "@/components/DriverForm";

export const metadata = { title: "Edit Driver — TransitOps" };

export default async function EditDriverPage({ params }) {
  const { id } = await params;
  const [session, driver] = await Promise.all([getSession(), getDriver(id)]);
  if (!can(session?.permissions, "drivers", "update")) redirect(`/drivers/${id}`);
  if (!driver) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/drivers/${id}`} className="text-sm text-slate-500 hover:text-slate-300">
          ← {driver.name}
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-100">Edit Driver</h1>
      </div>
      <DriverForm mode="edit" initial={driver} />
    </div>
  );
}
