// Driver controllers — translate HTTP <-> the driver service.
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');
const service = require('./driver.service');
const { createDriverSchema, updateDriverSchema } = require('./driver.validation');

function parseId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new AppError(400, 'Invalid driver id.', 'BAD_REQUEST');
  return id;
}

exports.list = asyncHandler(async (req, res) => {
  res.json(await service.list(req.query));
});

exports.getById = asyncHandler(async (req, res) => {
  res.json(await service.getById(parseId(req)));
});

exports.create = asyncHandler(async (req, res) => {
  const data = createDriverSchema.parse(req.body);
  res.status(201).json(await service.create(data));
});

exports.update = asyncHandler(async (req, res) => {
  const id = parseId(req);
  const data = updateDriverSchema.parse(req.body);
  res.json(await service.update(id, data));
});

exports.remove = asyncHandler(async (req, res) => {
  await service.remove(parseId(req));
  res.status(204).end();
});
