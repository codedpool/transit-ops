import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";

const ROLE_LABELS = {
  FLEET_MANAGER: "Fleet Manager",
  DRIVER: "Driver",
  SAFETY_OFFICER: "Safety Officer",
  FINANCIAL_ANALYST: "Financial Analyst",
};

function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Topbar({ user }) {
  const roleLabel = ROLE_LABELS[user?.role] || user?.role || "";

  return (
    <header className="flex h-16 items-center gap-3 border-b border-slate-800 bg-slate-900 px-5">
      {/* Global search — compact, with a keyboard affordance. */}
      <div className="relative w-full max-w-xs">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Search…"
          className="w-full rounded-md border border-slate-800 bg-slate-800/40 py-2 pl-9 pr-9 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-400/60 focus:bg-transparent focus:outline-none"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-slate-700 px-1.5 py-px font-mono text-[10px] text-slate-500 sm:block">
          /
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />

        <span className="mx-1 hidden h-6 w-px bg-slate-800 sm:block" />

        {/* Account cluster */}
        <div className="hidden items-center gap-2.5 rounded-md py-1 pl-1.5 pr-1 sm:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-400/15 font-mono text-xs font-semibold tracking-wide text-amber-400 ring-1 ring-inset ring-amber-400/30">
            {initials(user?.name)}
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-100">{user?.name}</p>
            <p className="text-xs text-slate-500">{roleLabel}</p>
          </div>
        </div>

        <LogoutButton />
      </div>
    </header>
  );
}
