"use client";

// Page navigation driven through the URL ?page= param.
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function Pagination({ pagination, param = "page" }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  if (!pagination) return null;

  const { page, totalPages, total, pageSize } = pagination;

  function goto(p) {
    const sp = new URLSearchParams(params.toString());
    sp.set(param, String(p));
    router.push(`${pathname}?${sp.toString()}#${param}`);
  }

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between text-sm text-slate-400">
      <span>
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => goto(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-800/60 disabled:opacity-40"
        >
          Prev
        </button>
        <span className="tabular-nums">
          Page {page} / {totalPages}
        </span>
        <button
          onClick={() => goto(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-800/60 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
