// Vehicle service — all DB access + business rules for the vehicle registry.
const prisma = require('../../lib/prisma');
const AppError = require('../../utils/AppError');
const { parseListParams, paginated } = require('../../utils/listParams');

const SORTABLE = [
  'registrationNumber',
  'nameOrModel',
  'type',
  'maxLoadCapacity',
  'odometer',
  'acquisitionCost',
  'status',
  'createdAt',
];

// Decimal (acquisitionCost) → Number so the JSON client gets plain numbers.
function toDTO(v) {
  return { ...v, acquisitionCost: v.acquisitionCost == null ? null : Number(v.acquisitionCost) };
}

function buildWhere(query) {
  const where = {};
  const q = (query.q || '').trim();
  if (q) {
    where.OR = [
      { registrationNumber: { contains: q, mode: 'insensitive' } },
      { nameOrModel: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (query.status) where.status = query.status;
  if (query.type) where.type = query.type;
  if (query.region) where.region = { equals: query.region, mode: 'insensitive' };
  return where;
}

async function list(query) {
  const { skip, take, orderBy, page, pageSize } = parseListParams(query, {
    sortable: SORTABLE,
    defaultSort: 'createdAt',
  });
  const where = buildWhere(query);

  const [rows, total] = await Promise.all([
    prisma.vehicle.findMany({ where, orderBy, skip, take }),
    prisma.vehicle.count({ where }),
  ]);

  return paginated(rows.map(toDTO), total, { page, pageSize });
}

async function getById(id) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new AppError(404, 'Vehicle not found.', 'NOT_FOUND');
  return toDTO(vehicle);
}

// Normalize empty-string region to null before persisting.
function clean(data) {
  const out = { ...data };
  if (out.region === '') out.region = null;
  return out;
}

async function create(data) {
  const vehicle = await prisma.vehicle.create({ data: clean(data) });
  return toDTO(vehicle);
}

async function update(id, data) {
  await getById(id); // 404 if missing
  const vehicle = await prisma.vehicle.update({ where: { id }, data: clean(data) });
  return toDTO(vehicle);
}

async function remove(id) {
  await getById(id); // 404 if missing
  // FK Restrict on trips/maintenance/fuel/expenses → Prisma throws P2003,
  // translated to a friendly 409 by the central error handler.
  await prisma.vehicle.delete({ where: { id } });
}

module.exports = { list, getById, create, update, remove, SORTABLE };
