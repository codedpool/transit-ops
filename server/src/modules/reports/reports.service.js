// Reports & analytics — all figures computed live from the DB with grouped
// aggregates. Formulas (PDF Section 3.8):
//   Fuel Efficiency = Distance / Fuel
//   Operational Cost = Fuel + Maintenance + Expenses
//   Vehicle ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
//   Profitability = Revenue - Operational Cost
const prisma = require('../../lib/prisma');

const num = (v) => (v == null ? 0 : Number(v));
const round = (n, d = 0) => {
  const f = 10 ** d;
  return Math.round(num(n) * f) / f;
};

function indexBy(arr, key) {
  const m = {};
  for (const row of arr) m[row[key]] = row;
  return m;
}

async function collect() {
  const [vehicles, fuelAgg, maintAgg, expenseAgg, completedTrips] = await Promise.all([
    prisma.vehicle.findMany({ orderBy: { nameOrModel: 'asc' } }),
    prisma.fuelLog.groupBy({ by: ['vehicleId'], _sum: { cost: true, liters: true } }),
    prisma.maintenanceLog.groupBy({ by: ['vehicleId'], _sum: { cost: true } }),
    prisma.expense.groupBy({ by: ['vehicleId'], _sum: { amount: true } }),
    prisma.trip.findMany({
      where: { status: 'COMPLETED' },
      select: {
        vehicleId: true,
        startOdometer: true,
        finalOdometer: true,
        plannedDistance: true,
        revenue: true,
        fuelConsumed: true,
        completionTime: true,
      },
    }),
  ]);

  const fuelMap = indexBy(fuelAgg, 'vehicleId');
  const maintMap = indexBy(maintAgg, 'vehicleId');
  const expenseMap = indexBy(expenseAgg, 'vehicleId');

  const tripAgg = {};
  const monthly = {};
  for (const t of completedTrips) {
    const a = tripAgg[t.vehicleId] || { distance: 0, revenue: 0, fuelConsumed: 0 };
    const dist =
      t.finalOdometer != null && t.startOdometer != null
        ? num(t.finalOdometer) - num(t.startOdometer)
        : num(t.plannedDistance);
    a.distance += Math.max(0, dist);
    a.revenue += num(t.revenue);
    a.fuelConsumed += num(t.fuelConsumed);
    tripAgg[t.vehicleId] = a;

    if (t.completionTime) {
      const d = new Date(t.completionTime);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = (monthly[key] || 0) + num(t.revenue);
    }
  }

  const rows = vehicles.map((v) => {
    const fuelCost = num(fuelMap[v.id]?._sum?.cost);
    const fuelLiters = num(fuelMap[v.id]?._sum?.liters);
    const maintenanceCost = num(maintMap[v.id]?._sum?.cost);
    const expenseCost = num(expenseMap[v.id]?._sum?.amount);
    const trip = tripAgg[v.id] || { distance: 0, revenue: 0, fuelConsumed: 0 };
    // Prefer logged fuel volume; fall back to fuel consumed on completed trips.
    const fuelForEff = fuelLiters > 0 ? fuelLiters : trip.fuelConsumed;
    const acquisitionCost = num(v.acquisitionCost);
    const operationalCost = fuelCost + maintenanceCost + expenseCost;
    const revenue = trip.revenue;
    const roi =
      acquisitionCost > 0
        ? ((revenue - (maintenanceCost + fuelCost)) / acquisitionCost) * 100
        : 0;

    return {
      id: v.id,
      registrationNumber: v.registrationNumber,
      nameOrModel: v.nameOrModel,
      type: v.type,
      distance: round(trip.distance),
      fuelLiters: round(fuelForEff, 1),
      fuelCost: round(fuelCost),
      maintenanceCost: round(maintenanceCost),
      expenseCost: round(expenseCost),
      operationalCost: round(operationalCost),
      revenue: round(revenue),
      profitability: round(revenue - operationalCost),
      roi: round(roi, 1),
      fuelEfficiency: fuelForEff > 0 ? round(trip.distance / fuelForEff, 1) : 0,
    };
  });

  return { vehicles, rows, monthly };
}

async function getOverview() {
  const { vehicles, rows, monthly } = await collect();

  const totals = rows.reduce(
    (acc, r) => {
      acc.distance += r.distance;
      acc.fuelLiters += r.fuelLiters;
      acc.fuelCost += r.fuelCost;
      acc.maintenanceCost += r.maintenanceCost;
      acc.expenseCost += r.expenseCost;
      acc.revenue += r.revenue;
      return acc;
    },
    { distance: 0, fuelLiters: 0, fuelCost: 0, maintenanceCost: 0, expenseCost: 0, revenue: 0 }
  );

  const totalAcquisition = vehicles.reduce((s, v) => s + num(v.acquisitionCost), 0);
  const nonRetired = vehicles.filter((v) => v.status !== 'RETIRED').length;
  const onTrip = vehicles.filter((v) => v.status === 'ON_TRIP').length;
  const operationalCost = totals.fuelCost + totals.maintenanceCost + totals.expenseCost;

  const kpis = {
    fuelEfficiency: totals.fuelLiters > 0 ? round(totals.distance / totals.fuelLiters, 1) : 0,
    fleetUtilization: nonRetired > 0 ? round((onTrip / nonRetired) * 100) : 0,
    operationalCost: round(operationalCost),
    vehicleRoi:
      totalAcquisition > 0
        ? round(((totals.revenue - (totals.maintenanceCost + totals.fuelCost)) / totalAcquisition) * 100, 1)
        : 0,
  };

  const monthlyRevenue = Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue: round(revenue) }));

  const topCostliest = [...rows]
    .sort((a, b) => b.operationalCost - a.operationalCost)
    .slice(0, 5)
    .filter((r) => r.operationalCost > 0)
    .map((r) => ({ name: r.nameOrModel, operationalCost: r.operationalCost }));

  return { kpis, monthlyRevenue, topCostliest, vehicles: rows };
}

function csvCell(v) {
  const s = String(v == null ? '' : v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function getCsv() {
  const { rows } = await collect();
  const headers = [
    'Registration', 'Name', 'Type', 'Distance (km)', 'Fuel (L)', 'Fuel Cost',
    'Maintenance', 'Expenses', 'Operational Cost', 'Revenue', 'Profitability',
    'ROI %', 'Fuel Efficiency (km/L)',
  ];
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.registrationNumber, r.nameOrModel, r.type, r.distance, r.fuelLiters,
        r.fuelCost, r.maintenanceCost, r.expenseCost, r.operationalCost,
        r.revenue, r.profitability, r.roi, r.fuelEfficiency,
      ]
        .map(csvCell)
        .join(',')
    );
  }
  return lines.join('\n');
}

module.exports = { getOverview, getCsv };
