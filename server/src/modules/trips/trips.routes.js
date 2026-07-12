// Trip routes: /api/trips/*  — all authenticated; state changes are CSRF-guarded.
const express = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const csrfProtection = require('../../middleware/csrf');
const { MODULES, ACTIONS } = require('../../constants/permissions');
const controller = require('./trips.controller');

const router = express.Router();
router.use(authenticate);

router.get('/', authorize(MODULES.TRIPS, ACTIONS.READ), controller.list);
router.get('/options', authorize(MODULES.TRIPS, ACTIONS.CREATE), controller.options);
router.post('/', authorize(MODULES.TRIPS, ACTIONS.CREATE), csrfProtection, controller.create);
router.post('/:id/dispatch', authorize(MODULES.TRIPS, ACTIONS.DISPATCH), csrfProtection, controller.dispatch);
router.post('/:id/complete', authorize(MODULES.TRIPS, ACTIONS.COMPLETE), csrfProtection, controller.complete);
router.post('/:id/cancel', authorize(MODULES.TRIPS, ACTIONS.CANCEL), csrfProtection, controller.cancel);

module.exports = router;
