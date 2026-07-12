import StatusBadge from "@/components/StatusBadge";

export default function RecentTripsTable({ trips }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
            <th className="pb-3 font-medium">Trip</th>
            <th className="pb-3 font-medium">Vehicle</th>
            <th className="pb-3 font-medium">Driver</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">ETA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {trips.map((t) => (
            <tr key={t.id} className="text-slate-300">
              <td className="py-3 font-mono text-slate-400">{t.id}</td>
              <td className="py-3">{t.vehicle}</td>
              <td className="py-3">{t.driver}</td>
              <td className="py-3">
                <StatusBadge status={t.status} />
              </td>
              <td className="py-3 text-slate-400">{t.eta}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
