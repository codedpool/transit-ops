const asyncHandler = require('../../utils/asyncHandler');
const service = require('./maintenance.service');
const { createMaintenanceSchema } = require('./maintenance.validation');

exports.list = asyncHandler(async (req, res) => {
  res.json({ data: await service.list(req.query) });
});

exports.options = asyncHandler(async (req, res) => {
  res.json({ vehicles: await service.serviceableVehicles() });
});

exports.create = asyncHandler(async (req, res) => {
  const data = createMaintenanceSchema.parse(req.body);
  const record = await service.create(data, req.user.id);
  res.status(201).json({ data: record });
});

exports.close = asyncHandler(async (req, res) => {
  const record = await service.close(Number(req.params.id));
  res.json({ data: record });
});
