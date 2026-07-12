// Driver service — DB access + license-expiry business logic.
const prisma = require('../../lib/prisma');
const AppError = require('../../utils/AppError');
const { parseListParams, paginated } = require('../../utils/listParams');

const SORTABLE = [
  'name',
  'licenseNumber',
  'licenseCategory',
  'licenseExpiryDate',
  'safetyScore',
  'status',
  'createdAt',
];

const EXPIRING_WINDOW_DAYS = 30;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Attach derived license flags the UI uses to surface expiry clearly.
function toDTO(d) {
  const today = startOfToday();
  const expiry = d.licenseExpiryDate ? new Date(d.licenseExpiryDate) : null;
  let licenseExpired = false;
  let licenseExpiringSoon = false;
  if (expiry) {
    const soon = new Date(today);
    soon.setDate(soon.getDate() + EXPIRING_WINDOW_DAYS);
    licenseExpired = expiry < today;
    licenseExpiringSoon = !licenseExpired && expiry <= soon;
  }
  return { ...d, licenseExpired, licenseExpiringSoon };
}

function buildWhere(query) {
  const where = {};
  const q = (query.q || '').trim();
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { licenseNumber: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (query.status) where.status = query.status;
  if (query.region) where.region = { equals: query.region, mode: 'insensitive' };
  if (query.licenseCategory) where.licenseCategory = query.licenseCategory;

  // License filter served from the indexed licenseExpiryDate column.
  if (query.license === 'expired' || query.license === 'expiring') {
    const today = startOfToday();
    if (query.license === 'expired') {
      where.licenseExpiryDate = { lt: today };
    } else {
      const soon = new Date(today);
      soon.setDate(soon.getDate() + EXPIRING_WINDOW_DAYS);
      where.licenseExpiryDate = { gte: today, lte: soon };
    }
  }
  return where;
}

async function list(query) {
  const { skip, take, orderBy, page, pageSize } = parseListParams(query, {
    sortable: SORTABLE,
    defaultSort: 'createdAt',
  });
  const where = buildWhere(query);

  const [rows, total] = await Promise.all([
    prisma.driver.findMany({ where, orderBy, skip, take }),
    prisma.driver.count({ where }),
  ]);

  return paginated(rows.map(toDTO), total, { page, pageSize });
}

async function getById(id) {
  const driver = await prisma.driver.findUnique({ where: { id } });
  if (!driver) throw new AppError(404, 'Driver not found.', 'NOT_FOUND');
  return toDTO(driver);
}

function clean(data) {
  const out = { ...data };
  if (out.region === '') out.region = null;
  return out;
}

async function create(data) {
  const driver = await prisma.driver.create({ data: clean(data) });
  return toDTO(driver);
}

async function update(id, data) {
  await getById(id);
  const driver = await prisma.driver.update({ where: { id }, data: clean(data) });
  return toDTO(driver);
}

async function remove(id) {
  await getById(id);
  // FK Restrict on trips → Prisma P2003 → friendly 409 via error handler.
  await prisma.driver.delete({ where: { id } });
}

module.exports = { list, getById, create, update, remove, SORTABLE };
