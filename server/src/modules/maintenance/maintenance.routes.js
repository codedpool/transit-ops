// Maintenance routes: /api/maintenance/*  — authenticated; state changes CSRF-guarded.
const express = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const csrfProtection = require('../../middleware/csrf');
const { MODULES, ACTIONS } = require('../../constants/permissions');
const controller = require('./maintenance.controller');

const router = express.Router();
router.use(authenticate);

router.get('/', authorize(MODULES.MAINTENANCE, ACTIONS.READ), controller.list);
router.get('/options', authorize(MODULES.MAINTENANCE, ACTIONS.CREATE), controller.options);
router.post('/', authorize(MODULES.MAINTENANCE, ACTIONS.CREATE), csrfProtection, controller.create);
router.post('/:id/close', authorize(MODULES.MAINTENANCE, ACTIONS.UPDATE), csrfProtection, controller.close);

module.exports = router;
