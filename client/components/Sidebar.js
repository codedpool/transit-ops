"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Each item maps to a permission module; the item is shown only if the user's
// role has at least read access. Enforcement is server-side — this is UX only.
const NAV = [
  { label: "Dashboard", href: "/dashboard", modules: ["dashboard"] },
  { label: "Fleet", href: "/fleet", modules: ["vehicles"] },
  { label: "Drivers", href: "/drivers", modules: ["drivers"] },
  { label: "Trips", href: "/trips", modules: ["trips"] },
  { label: "Maintenance", href: "/maintenance", modules: ["maintenance"] },
  { label: "Fuel & Expenses", href: "/fuel-expenses", modules: ["fuel", "expenses"] },
  { label: "Analytics", href: "/analytics", modules: ["reports"] },
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
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-900/60 md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-5">
        <Image
          src="/logo-mark.png"
          alt=""
          width={203}
          height={203}
          className="h-8 w-8"
        />
        <span className="text-lg font-semibold tracking-tight text-slate-100">
          TransitOps
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
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
