import { formatDate } from "@/lib/format";

// Surfaces license expiry state clearly: red for expired, amber for expiring soon.
export default function LicenseBadge({ expiryDate, expired, expiringSoon }) {
  const date = formatDate(expiryDate);
  if (expired) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-0.5 text-xs font-medium text-rose-400 ring-1 ring-inset ring-rose-500/25">
        {date} · Expired
      </span>
    );
  }
  if (expiringSoon) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400 ring-1 ring-inset ring-amber-500/25">
        {date} · Expiring soon
      </span>
    );
  }
  return <span className="text-slate-300">{date}</span>;
}
