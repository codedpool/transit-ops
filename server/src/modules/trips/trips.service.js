// Trip lifecycle + all mandatory business rules (PDF Section 4).
// Status transitions are atomic via prisma.$transaction so a vehicle/driver can
// never be left half-updated.
const prisma = require('../../lib/prisma');
const AppError = require('../../utils/AppError');

function isLicenseExpired(driver, now) {
  return driver.licenseExpiryDate && new Date(driver.licenseExpiryDate) < now;
}

// A vehicle is assignable only if it is not retired, in the shop, or already on a trip.
function assertVehicleAssignable(vehicle) {
  if (!vehicle) throw new AppError(404, 'Vehicle not found.', 'VEHICLE_NOT_FOUND');
  if (vehicle.status === 'RETIRED')
    throw new AppError(422, `Vehicle ${vehicle.nameOrModel} is retired and cannot be dispatched.`, 'VEHICLE_RETIRED');
  if (vehicle.status === 'IN_SHOP')
    throw new AppError(422, `Vehicle ${vehicle.nameOrModel} is in the shop and cannot be dispatched.`, 'VEHICLE_IN_SHOP');
  if (vehicle.status === 'ON_TRIP')
    throw new AppError(422, `Vehicle ${vehicle.nameOrModel} is already on a trip.`, 'VEHICLE_ON_TRIP');
}

// A driver is assignable only if not suspended, not already on a trip, and license valid.
function assertDriverAssignable(driver, now) {
  if (!driver) throw new AppError(404, 'Driver not found.', 'DRIVER_NOT_FOUND');
  if (driver.status === 'SUSPENDED')
    throw new AppError(422, `Driver ${driver.name} is suspended and cannot be assigned.`, 'DRIVER_SUSPENDED');
  if (driver.status === 'ON_TRIP')
    throw new AppError(422, `Driver ${driver.name} is already on a trip.`, 'DRIVER_ON_TRIP');
  if (isLicenseExpired(driver, now))
    throw new AppError(422, `Driver ${driver.name}'s license has expired.`, 'LICENSE_EXPIRED');
}

function assertCapacity(vehicle, cargoWeight) {
  if (cargoWeight > Number(vehicle.maxLoadCapacity)) {
    throw new AppError(
      422,
      `Cargo weight ${cargoWeight} kg exceeds ${vehicle.nameOrModel} capacity of ${vehicle.maxLoadCapacity} kg.`,
      'CAPACITY_EXCEEDED'
    );
  }
}

async function listTrips(filters = {}) {
  const where = {};
  if (filters.status) where.status = filters.status;
  return prisma.trip.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { vehicle: true, driver: true },
  });
}

// Only vehicles/drivers that can actually be dispatched appear in the picker.
async function getAssignableOptions() {
  const now = new Date();
  const [vehicles, drivers] = await Promise.all([
    prisma.vehicle.findMany({ where: { status: 'AVAILABLE' }, orderBy: { nameOrModel: 'asc' } }),
    prisma.driver.findMany({
      where: { status: 'AVAILABLE', licenseExpiryDate: { gte: now } },
      orderBy: { name: 'asc' },
    }),
  ]);
  return { vehicles, drivers };
}

async function createTrip(data, userId) {
  const now = new Date();
  const [vehicle, driver] = await Promise.all([
    prisma.vehicle.findUnique({ where: { id: data.vehicleId } }),
    prisma.driver.findUnique({ where: { id: data.driverId } }),
  ]);
  assertVehicleAssignable(vehicle);
  assertDriverAssignable(driver, now);
  assertCapacity(vehicle, data.cargoWeight);

  return prisma.trip.create({
    data: {
      source: data.source,
      destination: data.destination,
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      cargoWeight: data.cargoWeight,
      plannedDistance: data.plannedDistance,
      status: 'DRAFT',
      createdById: userId || null,
    },
    include: { vehicle: true, driver: true },
  });
}

async function dispatchTrip(id) {
  const now = new Date();
  const trip = await prisma.trip.findUnique({ where: { id }, include: { vehicle: true, driver: true } });
  if (!trip) throw new AppError(404, 'Trip not found.', 'TRIP_NOT_FOUND');
  if (trip.status !== 'DRAFT')
    throw new AppError(422, `Only draft trips can be dispatched (this trip is ${trip.status}).`, 'INVALID_TRANSITION');

  assertVehicleAssignable(trip.vehicle);
  assertDriverAssignable(trip.driver, now);
  assertCapacity(trip.vehicle, Number(trip.cargoWeight));

  return prisma.$transaction(async (tx) => {
    await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'ON_TRIP' } });
    await tx.driver.update({ where: { id: trip.driverId }, data: { status: 'ON_TRIP' } });
    return tx.trip.update({
      where: { id },
      data: { status: 'DISPATCHED', dispatchTime: now, startOdometer: trip.vehicle.odometer },
      include: { vehicle: true, driver: true },
    });
  });
}

async function completeTrip(id, data) {
  const trip = await prisma.trip.findUnique({ where: { id }, include: { vehicle: true, driver: true } });
  if (!trip) throw new AppError(404, 'Trip not found.', 'TRIP_NOT_FOUND');
  if (trip.status !== 'DISPATCHED')
    throw new AppError(422, `Only dispatched trips can be completed (this trip is ${trip.status}).`, 'INVALID_TRANSITION');

  const start = trip.startOdometer != null ? Number(trip.startOdometer) : Number(trip.vehicle.odometer);
  if (data.finalOdometer < start)
    throw new AppError(422, `Final odometer (${data.finalOdometer}) cannot be less than the start odometer (${start}).`, 'INVALID_ODOMETER');

  return prisma.$transaction(async (tx) => {
    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: 'AVAILABLE', odometer: data.finalOdometer },
    });
    await tx.driver.update({ where: { id: trip.driverId }, data: { status: 'AVAILABLE' } });
    return tx.trip.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completionTime: new Date(),
        finalOdometer: data.finalOdometer,
        fuelConsumed: data.fuelConsumed,
      },
      include: { vehicle: true, driver: true },
    });
  });
}

async function cancelTrip(id, data) {
  const trip = await prisma.trip.findUnique({ where: { id }, include: { vehicle: true, driver: true } });
  if (!trip) throw new AppError(404, 'Trip not found.', 'TRIP_NOT_FOUND');
  if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED')
    throw new AppError(422, `A ${trip.status.toLowerCase()} trip cannot be cancelled.`, 'INVALID_TRANSITION');

  const wasDispatched = trip.status === 'DISPATCHED';

  return prisma.$transaction(async (tx) => {
    if (wasDispatched) {
      if (trip.vehicle.status === 'ON_TRIP')
        await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'AVAILABLE' } });
      if (trip.driver.status === 'ON_TRIP')
        await tx.driver.update({ where: { id: trip.driverId }, data: { status: 'AVAILABLE' } });
    }
    return tx.trip.update({
      where: { id },
      data: { status: 'CANCELLED', cancellationReason: data.reason },
      include: { vehicle: true, driver: true },
    });
  });
}

module.exports = {
  listTrips,
  getAssignableOptions,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
};
