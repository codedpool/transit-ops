import { getSession, getFuelLogs, getExpenses, getCostSummary, getFuelExpenseOptions } from "@/lib/api";
import { can } from "@/lib/permissions";
import { titleize, formatCurrency, formatDate, formatNumber } from "@/lib/format";
import CostSummary from "@/components/fuel-expenses/CostSummary";
import FuelForm from "@/components/fuel-expenses/FuelForm";
import ExpenseForm from "@/components/fuel-expenses/ExpenseForm";
import Pagination from "@/components/Pagination";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";

export const metadata = { title: "Fuel & Expenses — TransitOps" };

const PAGE_SIZE = 8;

export default async function FuelExpensesPage({ searchParams }) {
  const sp = await searchParams;
  const fpage = Math.max(1, parseInt(sp.fpage, 10) || 1);
  const epage = Math.max(1, parseInt(sp.epage, 10) || 1);

  const session = await getSession();
  const perms = session?.permissions;

  // Sidebar hides this for roles without access; guard direct URL hits too.
  if (!can(perms, "fuel", "read") && !can(perms, "expenses", "read")) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400">
        You don&apos;t have access to Fuel &amp; Expenses.
      </div>
    );
  }

  const canCreateFuel = can(perms, "fuel", "create");
  const canDeleteFuel = can(perms, "fuel", "delete");
  const canCreateExpense = can(perms, "expenses", "create");
  const canDeleteExpense = can(perms, "expenses", "delete");
  const needOptions = canCreateFuel || canCreateExpense;

  const [costRows, fuel, expenses, options] = await Promise.all([
    getCostSummary(),
    getFuelLogs({ page: fpage, pageSize: PAGE_SIZE }),
    getExpenses({ page: epage, pageSize: PAGE_SIZE }),
    needOptions ? getFuelExpenseOptions() : Promise.resolve({ vehicles: [], trips: [] }),
  ]);

  const fuelRows = fuel?.data || [];
  const expenseRows = expenses?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Fuel &amp; Expenses</h1>
        <p className="text-sm text-slate-500">Operational spend tracking and cost per vehicle.</p>
      </div>

      <CostSummary rows={costRows} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Fuel */}
        <section id="fpage" className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Fuel Logs</h2>
          {canCreateFuel && <FuelForm vehicles={options.vehicles} trips={options.trips} />}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Vehicle</th>
                  <th className="pb-2 text-right font-medium">Liters</th>
                  <th className="pb-2 text-right font-medium">Cost</th>
                  {canDeleteFuel && <th className="pb-2"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {fuelRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">No fuel logs yet.</td>
                  </tr>
                )}
                {fuelRows.map((f) => (
                  <tr key={f.id} className="text-slate-300">
                    <td className="py-2.5">{formatDate(f.date)}</td>
                    <td className="py-2.5">{f.vehicle ? f.vehicle.nameOrModel : "—"}</td>
                    <td className="py-2.5 text-right tabular-nums">{formatNumber(f.liters, "L")}</td>
                    <td className="py-2.5 text-right tabular-nums">{formatCurrency(f.cost)}</td>
                    {canDeleteFuel && (
                      <td className="py-2.5 text-right">
                        <ConfirmDeleteButton entity="fuel" id={f.id} small />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={fuel?.pagination} param="fpage" />
        </section>

        {/* Expenses */}
        <section id="epage" className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Expenses</h2>
          {canCreateExpense && <ExpenseForm vehicles={options.vehicles} trips={options.trips} />}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Vehicle</th>
                  <th className="pb-2 font-medium">Category</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                  {canDeleteExpense && <th className="pb-2"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {expenseRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">No expenses yet.</td>
                  </tr>
                )}
                {expenseRows.map((e) => (
                  <tr key={e.id} className="text-slate-300">
                    <td className="py-2.5">{formatDate(e.date)}</td>
                    <td className="py-2.5">{e.vehicle ? e.vehicle.nameOrModel : "—"}</td>
                    <td className="py-2.5">{titleize(e.category)}</td>
                    <td className="py-2.5 text-right tabular-nums">{formatCurrency(e.amount)}</td>
                    {canDeleteExpense && (
                      <td className="py-2.5 text-right">
                        <ConfirmDeleteButton entity="expense" id={e.id} small />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={expenses?.pagination} param="epage" />
        </section>
      </div>
    </div>
  );
}
