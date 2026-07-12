import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/api";
import { can } from "@/lib/permissions";
import VehicleForm from "@/components/VehicleForm";

export const metadata = { title: "New Vehicle — TransitOps" };

export default async function NewVehiclePage() {
  const session = await getSession();
  if (!can(session?.permissions, "vehicles", "create")) redirect("/fleet");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/fleet" className="text-sm text-slate-500 hover:text-slate-300">
          ← Fleet
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-100">New Vehicle</h1>
      </div>
      <VehicleForm mode="create" />
    </div>
  );
}
