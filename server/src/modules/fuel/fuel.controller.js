// Fuel-log controllers — translate HTTP <-> the fuel service.
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');
const prisma = require('../../lib/prisma');
const service = require('./fuel.service');
const { createFuelSchema, updateFuelSchema } = require('./fuel.validation');

function parseId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new AppError(400, 'Invalid fuel log id.', 'BAD_REQUEST');
  return id;
}

// Vehicles + recent trips for the create-form dropdowns.
exports.options = asyncHandler(async (req, res) => {
  const [vehicles, trips] = await Promise.all([
    prisma.vehicle.findMany({
      orderBy: { nameOrModel: 'asc' },
      select: { id: true, nameOrModel: true, registrationNumber: true },
    }),
    prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, source: true, destination: true, status: true },
    }),
  ]);
  res.json({ vehicles, trips });
});

exports.list = asyncHandler(async (req, res) => {
  res.json(await service.list(req.query));
});

exports.getById = asyncHandler(async (req, res) => {
  res.json(await service.getById(parseId(req)));
});

exports.create = asyncHandler(async (req, res) => {
  const data = createFuelSchema.parse(req.body);
  res.status(201).json(await service.create(data, req.user.id));
});

exports.update = asyncHandler(async (req, res) => {
  const id = parseId(req);
  const data = updateFuelSchema.parse(req.body);
  res.json(await service.update(id, data));
});

exports.remove = asyncHandler(async (req, res) => {
  await service.remove(parseId(req));
  res.status(204).end();
});
