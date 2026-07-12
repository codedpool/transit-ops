"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Fleet", href: "/fleet" },
  { label: "Drivers", href: "/drivers" },
  { label: "Trips", href: "/trips" },
  { label: "Maintenance", href: "/maintenance" },
  { label: "Fuel & Expenses", href: "/fuel-expenses" },
  { label: "Analytics", href: "/analytics" },
  { label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-950/60 md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 font-bold text-slate-950">
          T
        </span>
        <span className="text-lg font-semibold tracking-tight text-slate-100">
          TransitOps
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-amber-500/10 font-medium text-amber-400 ring-1 ring-inset ring-amber-500/20"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4 text-xs text-slate-500">
        TransitOps © 2026
      </div>
    </aside>
  );
}
