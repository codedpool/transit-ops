// Dashboard aggregates computed live from the DB (grouped counts, no per-row loops).
// Optional region / vehicle-type filters scope every metric so the overview can be
// narrowed to a slice of the fleet.
const prisma = require('../../lib/prisma');

const TRIP_LABEL = {
  DRAFT: 'Draft',
  DISPATCHED: 'Dispatched',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

// Turn the dashboard controls into a Prisma vehicle filter.
function vehicleScope(query = {}) {
  const scope = {};
  const region = (query.region || '').trim();
  const type = (query.type || '').trim();
  if (region) scope.region = { equals: region, mode: 'insensitive' };
  if (type) scope.type = type;
  return scope;
}

// Distinct regions / types actually present, so the UI only offers real options.
async function getFilterOptions() {
  const [regions, types] = await Promise.all([
    prisma.vehicle.findMany({
      where: { region: { not: null } },
      distinct: ['region'],
      select: { region: true },
      orderBy: { region: 'asc' },
    }),
    prisma.vehicle.findMany({
      distinct: ['type'],
      select: { type: true },
      orderBy: { type: 'asc' },
    }),
  ]);
  return {
    regions: regions.map((r) => r.region).filter(Boolean),
    types: types.map((t) => t.type),
  };
}

async function getSummary(query = {}) {
  const scope = vehicleScope(query);
  const hasScope = Object.keys(scope).length > 0;
  const region = (query.region || '').trim();
  const type = (query.type || '').trim();

  // A vehicle count for a given status, within the current scope.
  const vWhere = (status) => ({ ...scope, status });
  // Trips are scoped by their vehicle; drivers only by region (they have no type).
  const tripScope = hasScope ? { vehicle: scope } : {};
  const driverRegion = region ? { region: { equals: region, mode: 'insensitive' } } : {};

  const [
    availableVehicles,
    onTripVehicles,
    inShopVehicles,
    retiredVehicles,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    recent,
    filterOptions,
  ] = await Promise.all([
    prisma.vehicle.count({ where: vWhere('AVAILABLE') }),
    prisma.vehicle.count({ where: vWhere('ON_TRIP') }),
    prisma.vehicle.count({ where: vWhere('IN_SHOP') }),
    prisma.vehicle.count({ where: vWhere('RETIRED') }),
    prisma.trip.count({ where: { status: 'DISPATCHED', ...tripScope } }),
    prisma.trip.count({ where: { status: 'DRAFT', ...tripScope } }),
    prisma.driver.count({ where: { status: { in: ['AVAILABLE', 'ON_TRIP'] }, ...driverRegion } }),
    prisma.trip.findMany({
      where: tripScope,
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { vehicle: true, driver: true },
    }),
    getFilterOptions(),
  ]);

  const activeVehicles = availableVehicles + onTripVehicles + inShopVehicles; // non-retired
  const fleetUtilization =
    activeVehicles > 0 ? Math.round((onTripVehicles / activeVehicles) * 100) : 0;

  const kpis = [
    { label: 'Active Vehicles', value: activeVehicles, accent: 'sky' },
    { label: 'Available Vehicles', value: availableVehicles, accent: 'emerald' },
    { label: 'Vehicles in Maintenance', value: inShopVehicles, accent: 'amber' },
    { label: 'Active Trips', value: activeTrips, accent: 'sky' },
    { label: 'Pending Trips', value: pendingTrips, accent: 'sky' },
    { label: 'Drivers on Duty', value: driversOnDuty, accent: 'sky' },
    { label: 'Fleet Utilization', value: `${fleetUtilization}%`, accent: 'emerald' },
  ];

  const recentTrips = recent.map((t) => ({
    id: `TR${String(t.id).padStart(4, '0')}`,
    vehicle: t.vehicle ? t.vehicle.nameOrModel : '—',
    driver: t.driver ? t.driver.name : '—',
    status: TRIP_LABEL[t.status] || t.status,
    eta:
      t.status === 'DISPATCHED'
        ? 'In transit'
        : t.status === 'DRAFT'
        ? 'Awaiting dispatch'
        : '—',
  }));

  const vehicleStatus = [
    { label: 'Available', value: availableVehicles, color: 'emerald' },
    { label: 'On Trip', value: onTripVehicles, color: 'sky' },
    { label: 'In Shop', value: inShopVehicles, color: 'amber' },
    { label: 'Retired', value: retiredVehicles, color: 'rose' },
  ];

  return { kpis, recentTrips, vehicleStatus, filterOptions, filters: { region, type } };
}

module.exports = { getSummary };
