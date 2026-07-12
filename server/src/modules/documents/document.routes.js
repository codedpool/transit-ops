// Vehicle document routes: /api/documents/*  (managed alongside vehicles).
const express = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const csrfProtection = require('../../middleware/csrf');
const { MODULES, ACTIONS } = require('../../constants/permissions');
const controller = require('./document.controller');

const router = express.Router();
router.use(authenticate);

router.get('/', authorize(MODULES.VEHICLES, ACTIONS.READ), controller.list);
router.post('/', authorize(MODULES.VEHICLES, ACTIONS.UPDATE), csrfProtection, controller.create);
router.delete('/:id', authorize(MODULES.VEHICLES, ACTIONS.DELETE), csrfProtection, controller.remove);

module.exports = router;
