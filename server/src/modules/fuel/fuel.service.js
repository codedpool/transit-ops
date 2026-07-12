// Fuel-log service — DB access for fuel records.
const prisma = require('../../lib/prisma');
const AppError = require('../../utils/AppError');
const { parseListParams, paginated } = require('../../utils/listParams');

const SORTABLE = ['date', 'liters', 'cost', 'odometerReading', 'createdAt'];

function toDTO(f) {
  return { ...f, cost: f.cost == null ? null : Number(f.cost) };
}

function buildWhere(query) {
  const where = {};
  if (query.vehicleId) where.vehicleId = Number(query.vehicleId);
  if (query.tripId) where.relatedTripId = Number(query.tripId);
  if (query.from || query.to) {
    where.date = {};
    if (query.from) where.date.gte = new Date(query.from);
    if (query.to) where.date.lte = new Date(query.to);
  }
  return where;
}

async function list(query) {
  const { skip, take, orderBy, page, pageSize } = parseListParams(query, {
    sortable: SORTABLE,
    defaultSort: 'date',
  });
  const where = buildWhere(query);
  const [rows, total] = await Promise.all([
    prisma.fuelLog.findMany({ where, orderBy, skip, take, include: { vehicle: true } }),
    prisma.fuelLog.count({ where }),
  ]);
  return paginated(rows.map(toDTO), total, { page, pageSize });
}

async function getById(id) {
  const row = await prisma.fuelLog.findUnique({ where: { id }, include: { vehicle: true } });
  if (!row) throw new AppError(404, 'Fuel log not found.', 'NOT_FOUND');
  return toDTO(row);
}

async function create(data, userId) {
  const row = await prisma.fuelLog.create({
    data: { ...data, createdById: userId || null },
    include: { vehicle: true },
  });
  return toDTO(row);
}

async function update(id, data) {
  await getById(id);
  const row = await prisma.fuelLog.update({ where: { id }, data, include: { vehicle: true } });
  return toDTO(row);
}

async function remove(id) {
  await getById(id);
  await prisma.fuelLog.delete({ where: { id } });
}

module.exports = { list, getById, create, update, remove };
