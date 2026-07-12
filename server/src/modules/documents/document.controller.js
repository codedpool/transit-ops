const asyncHandler = require('../../utils/asyncHandler');
const service = require('./document.service');
const { createDocumentSchema } = require('./document.validation');

exports.list = asyncHandler(async (req, res) => {
  if (!req.query.vehicleId) return res.json({ data: [] });
  res.json({ data: await service.listByVehicle(req.query.vehicleId) });
});

exports.create = asyncHandler(async (req, res) => {
  const data = createDocumentSchema.parse(req.body);
  res.status(201).json({ data: await service.create(data, req.user.id) });
});

exports.remove = asyncHandler(async (req, res) => {
  await service.remove(Number(req.params.id));
  res.status(204).end();
});
