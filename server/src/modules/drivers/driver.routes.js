// Driver routes: /api/drivers/*  (RESTful resource)
// Read for any role with drivers:read; writes require drivers:create/update/delete
// (Safety Officer) and are CSRF-guarded.
const express = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const csrfProtection = require('../../middleware/csrf');
const { MODULES, ACTIONS } = require('../../constants/permissions');
const controller = require('./driver.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(MODULES.DRIVERS, ACTIONS.READ), controller.list);
router.get('/:id', authorize(MODULES.DRIVERS, ACTIONS.READ), controller.getById);
router.post('/', authorize(MODULES.DRIVERS, ACTIONS.CREATE), csrfProtection, controller.create);
router.put('/:id', authorize(MODULES.DRIVERS, ACTIONS.UPDATE), csrfProtection, controller.update);
router.delete('/:id', authorize(MODULES.DRIVERS, ACTIONS.DELETE), csrfProtection, controller.remove);

module.exports = router;
