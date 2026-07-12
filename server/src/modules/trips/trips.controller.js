const asyncHandler = require('../../utils/asyncHandler');
const service = require('./trips.service');
const {
  createTripSchema,
  completeTripSchema,
  cancelTripSchema,
} = require('./trips.validation');

exports.list = asyncHandler(async (req, res) => {
  const trips = await service.listTrips({ status: req.query.status });
  res.json({ data: trips });
});

exports.options = asyncHandler(async (req, res) => {
  res.json(await service.getAssignableOptions());
});

exports.create = asyncHandler(async (req, res) => {
  const data = createTripSchema.parse(req.body);
  const trip = await service.createTrip(data, req.user.id);
  res.status(201).json({ data: trip });
});

exports.dispatch = asyncHandler(async (req, res) => {
  const trip = await service.dispatchTrip(Number(req.params.id));
  res.json({ data: trip });
});

exports.complete = asyncHandler(async (req, res) => {
  const data = completeTripSchema.parse(req.body);
  const trip = await service.completeTrip(Number(req.params.id), data);
  res.json({ data: trip });
});

exports.cancel = asyncHandler(async (req, res) => {
  const data = cancelTripSchema.parse(req.body);
  const trip = await service.cancelTrip(Number(req.params.id), data);
  res.json({ data: trip });
});
