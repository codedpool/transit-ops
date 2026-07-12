import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/api";
import { can } from "@/lib/permissions";
import DriverForm from "@/components/DriverForm";

export const metadata = { title: "New Driver — TransitOps" };

export default async function NewDriverPage() {
  const session = await getSession();
  if (!can(session?.permissions, "drivers", "create")) redirect("/drivers");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/drivers" className="text-sm text-slate-500 hover:text-slate-300">
          ← Drivers
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-100">New Driver</h1>
      </div>
      <DriverForm mode="create" />
    </div>
  );
}
