// Expense controllers — translate HTTP <-> the expense service.
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');
const service = require('./expense.service');
const { createExpenseSchema, updateExpenseSchema } = require('./expense.validation');

function parseId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new AppError(400, 'Invalid expense id.', 'BAD_REQUEST');
  return id;
}

exports.list = asyncHandler(async (req, res) => {
  res.json(await service.list(req.query));
});

// Per-vehicle operational cost (Fuel + Maintenance + Expenses).
exports.costSummary = asyncHandler(async (req, res) => {
  res.json({ data: await service.costByVehicle() });
});

exports.getById = asyncHandler(async (req, res) => {
  res.json(await service.getById(parseId(req)));
});

exports.create = asyncHandler(async (req, res) => {
  const data = createExpenseSchema.parse(req.body);
  res.status(201).json(await service.create(data, req.user.id));
});

exports.update = asyncHandler(async (req, res) => {
  const id = parseId(req);
  const data = updateExpenseSchema.parse(req.body);
  res.json(await service.update(id, data));
});

exports.remove = asyncHandler(async (req, res) => {
  await service.remove(parseId(req));
  res.status(204).end();
});
