const PDFDocument = require('pdfkit');
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

exports.exportPdf = asyncHandler(async (req, res) => {
  const { kpis, vehicles } = await service.getOverview();

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="transitops-report.pdf"');
  doc.pipe(res);

  doc.fontSize(18).fillColor('#111').text('TransitOps — Fleet Analytics');
  doc.moveDown(0.3);
  doc
    .fontSize(10)
    .fillColor('#555')
    .text(
      `Fuel Efficiency ${kpis.fuelEfficiency} km/L     Fleet Utilization ${kpis.fleetUtilization}%     ` +
        `Operational Cost ${kpis.operationalCost}     Vehicle ROI ${kpis.vehicleRoi}%`
    );
  doc.moveDown(1);

  const cols = [
    { label: 'Vehicle', x: 40, w: 110 },
    { label: 'Revenue', x: 150, w: 80 },
    { label: 'Op. Cost', x: 230, w: 80 },
    { label: 'Profit', x: 310, w: 80 },
    { label: 'ROI %', x: 390, w: 60 },
    { label: 'km/L', x: 450, w: 60 },
  ];

  let y = doc.y;
  doc.fontSize(9).fillColor('#000');
  cols.forEach((c) => doc.text(c.label, c.x, y, { width: c.w }));
  y += 15;
  doc.moveTo(40, y).lineTo(555, y).strokeColor('#cccccc').stroke();
  y += 6;

  doc.fillColor('#333');
  for (const v of vehicles) {
    if (y > 780) {
      doc.addPage();
      y = 40;
    }
    const cells = [
      v.nameOrModel,
      v.revenue.toLocaleString(),
      v.operationalCost.toLocaleString(),
      v.profitability.toLocaleString(),
      `${v.roi}%`,
      String(v.fuelEfficiency),
    ];
    cols.forEach((c, i) => doc.text(cells[i], c.x, y, { width: c.w }));
    y += 15;
  }

  doc.end();
});
