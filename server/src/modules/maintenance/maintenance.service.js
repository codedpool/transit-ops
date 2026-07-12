// Maintenance service — service records + the In Shop / Available vehicle transitions.
// Status changes are atomic via prisma.$transaction.
const prisma = require('../../lib/prisma');
const AppError = require('../../utils/AppError');

const ACTIVE_STATUSES = ['OPEN', 'IN_PROGRESS'];

function toDTO(m) {
  return { ...m, cost: m.cost == null ? null : Number(m.cost) };
}

async function list(query = {}) {
  const where = {};
  if (query.status) where.status = query.status;
  if (query.vehicleId) where.vehicleId = Number(query.vehicleId);
  const rows = await prisma.maintenanceLog.findMany({
    where,
    orderBy: { openedAt: 'desc' },
    include: { vehicle: true },
  });
  return rows.map(toDTO);
}

// Vehicles that can be sent for service: not retired, not currently on a trip.
async function serviceableVehicles() {
  return prisma.vehicle.findMany({
    where: { status: { in: ['AVAILABLE', 'IN_SHOP'] } },
    orderBy: { nameOrModel: 'asc' },
  });
}

async function create(data, userId) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle) throw new AppError(404, 'Vehicle not found.', 'VEHICLE_NOT_FOUND');
  if (vehicle.status === 'ON_TRIP')
    throw new AppError(422, `${vehicle.nameOrModel} is on a trip; complete or cancel it before servicing.`, 'VEHICLE_ON_TRIP');
  if (vehicle.status === 'RETIRED')
    throw new AppError(422, `${vehicle.nameOrModel} is retired and cannot be serviced.`, 'VEHICLE_RETIRED');

  const status = data.status || 'OPEN';
  const isActive = ACTIVE_STATUSES.includes(status);

  const record = await prisma.$transaction(async (tx) => {
    const created = await tx.maintenanceLog.create({
      data: {
        vehicleId: data.vehicleId,
        serviceType: data.serviceType,
        issueNotes: data.issueNotes || null,
        cost: data.cost != null ? data.cost : null,
        status,
        remarks: data.remarks || null,
        closedAt: status === 'COMPLETED' ? new Date() : null,
        createdById: userId || null,
      },
      include: { vehicle: true },
    });
    // Creating an ACTIVE maintenance record moves the vehicle to In Shop.
    if (isActive && vehicle.status !== 'IN_SHOP') {
      await tx.vehicle.update({ where: { id: vehicle.id }, data: { status: 'IN_SHOP' } });
    }
    return created;
  });

  return toDTO(record);
}

async function close(id) {
  const record = await prisma.maintenanceLog.findUnique({ where: { id }, include: { vehicle: true } });
  if (!record) throw new AppError(404, 'Maintenance record not found.', 'NOT_FOUND');
  if (record.status === 'COMPLETED')
    throw new AppError(422, 'This maintenance record is already completed.', 'ALREADY_CLOSED');

  const updated = await prisma.$transaction(async (tx) => {
    const closed = await tx.maintenanceLog.update({
      where: { id },
      data: { status: 'COMPLETED', closedAt: new Date() },
      include: { vehicle: true },
    });
    // Restore to Available unless the vehicle is retired or still has other open work.
    const stillActive = await tx.maintenanceLog.count({
      where: { vehicleId: record.vehicleId, status: { in: ACTIVE_STATUSES }, NOT: { id } },
    });
    if (stillActive === 0 && record.vehicle.status !== 'RETIRED') {
      await tx.vehicle.update({ where: { id: record.vehicleId }, data: { status: 'AVAILABLE' } });
    }
    return closed;
  });

  return toDTO(updated);
}

module.exports = { list, serviceableVehicles, create, close };
