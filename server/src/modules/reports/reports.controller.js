const asyncHandler = require('../../utils/asyncHandler');
const service = require('./reports.service');

exports.overview = asyncHandler(async (req, res) => {
  res.json(await service.getOverview());
});

exports.exportCsv = asyncHandler(async (req, res) => {
  const csv = await service.getCsv();
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="transitops-report.csv"');
  res.send(csv);
});
