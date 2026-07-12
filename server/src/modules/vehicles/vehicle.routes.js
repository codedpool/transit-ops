// Vehicle routes: /api/vehicles/*  (RESTful resource)
// Read for any role with vehicles:read; writes require vehicles:create/update/delete
// (Fleet Manager) and are CSRF-guarded.
const express = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const csrfProtection = require('../../middleware/csrf');
const { MODULES, ACTIONS } = require('../../constants/permissions');
const controller = require('./vehicle.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(MODULES.VEHICLES, ACTIONS.READ), controller.list);
router.get('/:id', authorize(MODULES.VEHICLES, ACTIONS.READ), controller.getById);
router.post('/', authorize(MODULES.VEHICLES, ACTIONS.CREATE), csrfProtection, controller.create);
router.put('/:id', authorize(MODULES.VEHICLES, ACTIONS.UPDATE), csrfProtection, controller.update);
router.delete('/:id', authorize(MODULES.VEHICLES, ACTIONS.DELETE), csrfProtection, controller.remove);

module.exports = router;
