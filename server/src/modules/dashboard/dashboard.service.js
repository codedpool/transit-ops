// Dashboard aggregates computed live from the DB (grouped counts, no per-row loops).
const prisma = require('../../lib/prisma');

const TRIP_LABEL = {
  DRAFT: 'Draft',
  DISPATCHED: 'Dispatched',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

async function getSummary() {
  const [
    availableVehicles,
    onTripVehicles,
    inShopVehicles,
    retiredVehicles,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    recent,
  ] = await Promise.all([
    prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
    prisma.vehicle.count({ where: { status: 'ON_TRIP' } }),
    prisma.vehicle.count({ where: { status: 'IN_SHOP' } }),
    prisma.vehicle.count({ where: { status: 'RETIRED' } }),
    prisma.trip.count({ where: { status: 'DISPATCHED' } }),
    prisma.trip.count({ where: { status: 'DRAFT' } }),
    prisma.driver.count({ where: { status: { in: ['AVAILABLE', 'ON_TRIP'] } } }),
    prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { vehicle: true, driver: true },
    }),
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

  return { kpis, recentTrips, vehicleStatus };
}

module.exports = { getSummary };
