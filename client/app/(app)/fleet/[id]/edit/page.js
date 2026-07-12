import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getVehicle, getSession } from "@/lib/api";
import { can } from "@/lib/permissions";
import VehicleForm from "@/components/VehicleForm";

export const metadata = { title: "Edit Vehicle — TransitOps" };

export default async function EditVehiclePage({ params }) {
  const { id } = await params;
  const [session, vehicle] = await Promise.all([getSession(), getVehicle(id)]);
  if (!can(session?.permissions, "vehicles", "update")) redirect(`/fleet/${id}`);
  if (!vehicle) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/fleet/${id}`} className="text-sm text-slate-500 hover:text-slate-300">
          ← {vehicle.registrationNumber}
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-100">Edit Vehicle</h1>
      </div>
      <VehicleForm mode="edit" initial={vehicle} />
    </div>
  );
}
