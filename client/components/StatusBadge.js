import { STATUS_STYLES } from "@/lib/status";

export default function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] ?? STATUS_STYLES.Draft;
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {status}
    </span>
  );
}
