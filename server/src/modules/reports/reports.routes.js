// Reports routes: /api/reports/*  — read-only analytics for any authenticated role.
const express = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const { MODULES, ACTIONS } = require('../../constants/permissions');
const controller = require('./reports.controller');

const router = express.Router();
router.use(authenticate);

router.get('/overview', authorize(MODULES.REPORTS, ACTIONS.READ), controller.overview);
router.get('/export.csv', authorize(MODULES.REPORTS, ACTIONS.READ), controller.exportCsv);
router.get('/export.pdf', authorize(MODULES.REPORTS, ACTIONS.READ), controller.exportPdf);

module.exports = router;
