const asyncHandler = require('../../utils/asyncHandler');
const dashboardService = require('./dashboard.service');

exports.summary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary(req.query);
  res.json(data);
});
