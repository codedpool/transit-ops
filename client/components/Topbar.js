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
    <header className="flex h-16 items-center gap-4 border-b border-slate-800 px-6">
      <div className="max-w-md flex-1">
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        <span className="text-sm text-slate-300">{user?.name}</span>
        <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs text-sky-400">
          {roleLabel}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-slate-100">
          {initials(user?.name)}
        </span>
        <LogoutButton />
      </div>
    </header>
  );
}
