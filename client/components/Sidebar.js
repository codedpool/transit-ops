"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Each item maps to a permission module; the item is shown only if the user's
// role has at least read access. Enforcement is server-side — this is UX only.
// The short code is a wayfinding-style label for the section, echoed in the nav.
const NAV = [
  { label: "Dashboard", href: "/dashboard", code: "OPS", modules: ["dashboard"] },
  { label: "Fleet", href: "/fleet", code: "FLT", modules: ["vehicles"] },
  { label: "Drivers", href: "/drivers", code: "DRV", modules: ["drivers"] },
  { label: "Trips", href: "/trips", code: "TRP", modules: ["trips"] },
  { label: "Maintenance", href: "/maintenance", code: "MNT", modules: ["maintenance"] },
  { label: "Fuel & Expenses", href: "/fuel-expenses", code: "FIN", modules: ["fuel", "expenses"] },
  { label: "Analytics", href: "/analytics", code: "RPT", modules: ["reports"] },
];

function canAccess(item, permissions) {
  if (!permissions) return false;
  return item.modules.some(
    (m) => Array.isArray(permissions[m]) && permissions[m].length > 0
  );
}

export default function Sidebar({ permissions }) {
  const pathname = usePathname();
  const items = NAV.filter((item) => canAccess(item, permissions));

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-900 md:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-800 px-5">
        <Image src="/logo-mark.png" alt="" width={203} height={203} className="h-8 w-8" />
        <span className="font-display text-lg font-semibold tracking-tight text-slate-100">
          TransitOps
        </span>
      </div>

      <p className="eyebrow px-5 pb-2 pt-5 text-slate-500">Operations</p>

      <nav className="flex-1 space-y-0.5 px-3">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-slate-800 font-medium text-slate-100"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full bg-amber-400 transition-all ${
                  active ? "h-4 w-[3px]" : "h-0 w-[3px]"
                }`}
              />
              {item.label}
              <span
                className={`font-mono text-[10px] tracking-wider ${
                  active ? "text-amber-400" : "text-slate-600 group-hover:text-slate-500"
                }`}
              >
                {item.code}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 border-t border-slate-800 px-5 py-4">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        <span className="eyebrow text-slate-500">System online · 2026</span>
      </div>
    </aside>
  );
}
