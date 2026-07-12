// Demo fleet data so the dashboard shows meaningful LIVE numbers.
// Idempotent for vehicles/drivers (upsert by unique key); trips only created if none exist.
//   node prisma/seed-demo.js
const prisma = require('../src/lib/prisma');

const VEHICLES = [
  { registrationNumber: 'GJ01AB452', nameOrModel: 'VAN-05', type: 'VAN', maxLoadCapacity: 500, odometer: 74000, acquisitionCost: 620000, status: 'AVAILABLE', region: 'North' },
  { registrationNumber: 'GJ01AB998', nameOrModel: 'TRUCK-11', type: 'TRUCK', maxLoadCapacity: 5000, odometer: 182000, acquisitionCost: 2450000, status: 'ON_TRIP', region: 'West' },
  { registrationNumber: 'GJ01AB120', nameOrModel: 'MINI-03', type: 'MINI', maxLoadCapacity: 1000, odometer: 66000, acquisitionCost: 410000, status: 'IN_SHOP', region: 'South' },
  { registrationNumber: 'GJ01AB008', nameOrModel: 'VAN-09', type: 'VAN', maxLoadCapacity: 750, odometer: 241900, acquisitionCost: 590000, status: 'RETIRED', region: 'East' },
  { registrationNumber: 'GJ01AB301', nameOrModel: 'TRUCK-04', type: 'TRUCK', maxLoadCapacity: 8000, odometer: 98000, acquisitionCost: 3100000, status: 'AVAILABLE', region: 'North' },
  { registrationNumber: 'GJ01AB077', nameOrModel: 'MINI-08', type: 'MINI', maxLoadCapacity: 1200, odometer: 33000, acquisitionCost: 480000, status: 'ON_TRIP', region: 'West' },
  { registrationNumber: 'GJ01AB210', nameOrModel: 'VAN-12', type: 'VAN', maxLoadCapacity: 600, odometer: 51000, acquisitionCost: 640000, status: 'AVAILABLE', region: 'South' },
];

const DRIVERS = [
  { name: 'Alex', licenseNumber: 'DL-88213', licenseCategory: 'LMV', licenseExpiryDate: new Date('2028-12-31'), contactNumber: '9876500000', safetyScore: 96, status: 'ON_TRIP', region: 'North' },
  { name: 'John', licenseNumber: 'DL-44120', licenseCategory: 'HMV', licenseExpiryDate: new Date('2025-03-31'), contactNumber: '9822000000', safetyScore: 81, status: 'SUSPENDED', region: 'West' },
  { name: 'Priya', licenseNumber: 'DL-77031', licenseCategory: 'LMV', licenseExpiryDate: new Date('2027-08-31'), contactNumber: '9911000000', safetyScore: 99, status: 'ON_TRIP', region: 'South' },
  { name: 'Suresh', licenseNumber: 'DL-90045', licenseCategory: 'HMV', licenseExpiryDate: new Date('2027-01-31'), contactNumber: '9744000000', safetyScore: 88, status: 'AVAILABLE', region: 'East' },
  { name: 'Meena', licenseNumber: 'DL-55210', licenseCategory: 'LMV', licenseExpiryDate: new Date('2029-05-31'), contactNumber: '9700000000', safetyScore: 92, status: 'AVAILABLE', region: 'North' },
];

async function main() {
  const vehByModel = {};
  for (const v of VEHICLES) {
    const row = await prisma.vehicle.upsert({
      where: { registrationNumber: v.registrationNumber },
      update: v,
      create: v,
    });
    vehByModel[v.nameOrModel] = row.id;
  }

  const drvByName = {};
  for (const d of DRIVERS) {
    const row = await prisma.driver.upsert({
      where: { licenseNumber: d.licenseNumber },
      update: d,
      create: d,
    });
    drvByName[d.name] = row.id;
  }

  const tripCount = await prisma.trip.count();
  if (tripCount === 0) {
    const dispatcher = await prisma.user.findUnique({
      where: { email: 'dispatch@transitops.local' },
    });
    const createdById = dispatcher ? dispatcher.id : null;

    const trips = [
      { source: 'Gandhinagar Depot', destination: 'Ahmedabad Hub', vehicleId: vehByModel['TRUCK-11'], driverId: drvByName['Alex'], cargoWeight: 3200, plannedDistance: 45, status: 'DISPATCHED', dispatchTime: new Date(), startOdometer: 182000, createdById },
      { source: 'Vatva', destination: 'Sanand Warehouse', vehicleId: vehByModel['MINI-08'], driverId: drvByName['Priya'], cargoWeight: 800, plannedDistance: 30, status: 'DISPATCHED', dispatchTime: new Date(), startOdometer: 33000, createdById },
      { source: 'Mansa', destination: 'Kalol Depot', vehicleId: vehByModel['VAN-05'], driverId: drvByName['Suresh'], cargoWeight: 400, plannedDistance: 38, status: 'COMPLETED', dispatchTime: new Date(Date.now() - 86400000), completionTime: new Date(), startOdometer: 73800, finalOdometer: 74000, fuelConsumed: 24, revenue: 5200, createdById },
      { source: 'Depot A', destination: 'Depot B', vehicleId: vehByModel['TRUCK-04'], driverId: drvByName['Meena'], cargoWeight: 1500, plannedDistance: 20, status: 'DRAFT', createdById },
    ];
    for (const t of trips) await prisma.trip.create({ data: t });
    console.log(`Seeded ${trips.length} demo trips.`);
  } else {
    console.log(`Trips already present (${tripCount}); skipped trip seeding.`);
  }

  // Fuel logs + expenses (idempotent: only when empty), for cost analytics.
  const analyst = await prisma.user.findUnique({ where: { email: 'finance@transitops.local' } });
  const loggedById = analyst ? analyst.id : null;

  if ((await prisma.fuelLog.count()) === 0) {
    const fuel = [
      { model: 'TRUCK-11', liters: 60, cost: 5400, date: '2026-06-20', odometerReading: 182000 },
      { model: 'VAN-05', liters: 24, cost: 2100, date: '2026-06-25', odometerReading: 74000 },
      { model: 'MINI-08', liters: 30, cost: 2700, date: '2026-07-01', odometerReading: 33000 },
      { model: 'TRUCK-04', liters: 80, cost: 7200, date: '2026-07-03', odometerReading: 98025 },
      { model: 'MINI-03', liters: 20, cost: 1800, date: '2026-06-28', odometerReading: 66000 },
    ];
    for (const f of fuel) {
      await prisma.fuelLog.create({
        data: {
          vehicleId: vehByModel[f.model],
          liters: f.liters,
          cost: f.cost,
          date: new Date(f.date),
          odometerReading: f.odometerReading,
          createdById: loggedById,
        },
      });
    }
    console.log(`Seeded ${fuel.length} fuel logs.`);
  }

  if ((await prisma.expense.count()) === 0) {
    const expenses = [
      { model: 'TRUCK-11', category: 'INSURANCE', amount: 8000, date: '2026-06-01', notes: 'Annual premium' },
      { model: 'TRUCK-11', category: 'TOLL', amount: 450, date: '2026-06-21' },
      { model: 'TRUCK-04', category: 'TOLL', amount: 600, date: '2026-07-03' },
      { model: 'MINI-08', category: 'PARKING', amount: 120, date: '2026-07-02' },
      { model: 'VAN-05', category: 'FINE', amount: 1000, date: '2026-06-26', notes: 'Overspeeding' },
    ];
    for (const e of expenses) {
      await prisma.expense.create({
        data: {
          vehicleId: vehByModel[e.model],
          category: e.category,
          amount: e.amount,
          date: new Date(e.date),
          notes: e.notes || null,
          createdById: loggedById,
        },
      });
    }
    console.log(`Seeded ${expenses.length} expenses.`);
  }

  console.log(`Seeded ${VEHICLES.length} vehicles and ${DRIVERS.length} drivers.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
