// Fuel routes: /api/fuel/*  (RESTful resource)
// Financial Analyst owns full CRUD; Driver can create+read; Fleet Manager reads.
const express = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const csrfProtection = require('../../middleware/csrf');
const { MODULES, ACTIONS } = require('../../constants/permissions');
const controller = require('./fuel.controller');

const router = express.Router();
router.use(authenticate);

router.get('/', authorize(MODULES.FUEL, ACTIONS.READ), controller.list);
router.get('/options', authorize(MODULES.FUEL, ACTIONS.READ), controller.options);
router.get('/:id', authorize(MODULES.FUEL, ACTIONS.READ), controller.getById);
router.post('/', authorize(MODULES.FUEL, ACTIONS.CREATE), csrfProtection, controller.create);
router.put('/:id', authorize(MODULES.FUEL, ACTIONS.UPDATE), csrfProtection, controller.update);
router.delete('/:id', authorize(MODULES.FUEL, ACTIONS.DELETE), csrfProtection, controller.remove);

module.exports = router;
