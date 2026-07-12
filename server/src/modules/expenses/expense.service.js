// Expense service — DB access plus the per-vehicle operational-cost rollup.
const prisma = require('../../lib/prisma');
const AppError = require('../../utils/AppError');
const { parseListParams, paginated } = require('../../utils/listParams');

const SORTABLE = ['date', 'amount', 'category', 'createdAt'];

function toDTO(e) {
  return { ...e, amount: e.amount == null ? null : Number(e.amount) };
}

function clean(data) {
  const out = { ...data };
  if (out.notes === '') out.notes = null;
  return out;
}

function buildWhere(query) {
  const where = {};
  if (query.vehicleId) where.vehicleId = Number(query.vehicleId);
  if (query.category) where.category = query.category;
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
    prisma.expense.findMany({ where, orderBy, skip, take, include: { vehicle: true } }),
    prisma.expense.count({ where }),
  ]);
  return paginated(rows.map(toDTO), total, { page, pageSize });
}

async function getById(id) {
  const row = await prisma.expense.findUnique({ where: { id }, include: { vehicle: true } });
  if (!row) throw new AppError(404, 'Expense not found.', 'NOT_FOUND');
  return toDTO(row);
}

async function create(data, userId) {
  const row = await prisma.expense.create({
    data: { ...clean(data), createdById: userId || null },
    include: { vehicle: true },
  });
  return toDTO(row);
}

async function update(id, data) {
  await getById(id);
  const row = await prisma.expense.update({ where: { id }, data: clean(data), include: { vehicle: true } });
  return toDTO(row);
}

async function remove(id) {
  await getById(id);
  await prisma.expense.delete({ where: { id } });
}

// Operational cost per vehicle = SUM(fuel.cost) + SUM(maintenance.cost) + SUM(expense.amount).
// Computed with three grouped aggregate queries (no per-row loops, no N+1).
async function costByVehicle() {
  const [vehicles, fuelBy, maintBy, expBy] = await Promise.all([
    prisma.vehicle.findMany({
      orderBy: { nameOrModel: 'asc' },
      select: { id: true, nameOrModel: true, registrationNumber: true },
    }),
    prisma.fuelLog.groupBy({ by: ['vehicleId'], _sum: { cost: true } }),
    prisma.maintenanceLog.groupBy({ by: ['vehicleId'], _sum: { cost: true } }),
    prisma.expense.groupBy({ by: ['vehicleId'], _sum: { amount: true } }),
  ]);

  const fuelMap = Object.fromEntries(fuelBy.map((r) => [r.vehicleId, Number(r._sum.cost || 0)]));
  const maintMap = Object.fromEntries(maintBy.map((r) => [r.vehicleId, Number(r._sum.cost || 0)]));
  const expMap = Object.fromEntries(expBy.map((r) => [r.vehicleId, Number(r._sum.amount || 0)]));

  return vehicles
    .map((v) => {
      const fuel = fuelMap[v.id] || 0;
      const maintenance = maintMap[v.id] || 0;
      const expenses = expMap[v.id] || 0;
      return {
        vehicleId: v.id,
        nameOrModel: v.nameOrModel,
        registrationNumber: v.registrationNumber,
        fuel,
        maintenance,
        expenses,
        total: fuel + maintenance + expenses,
      };
    })
    .sort((a, b) => b.total - a.total);
}

module.exports = { list, getById, create, update, remove, costByVehicle };
