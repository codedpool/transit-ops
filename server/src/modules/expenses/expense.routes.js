// Expense routes: /api/expenses/*  (RESTful resource)
// Financial Analyst owns full CRUD; Driver can create+read; Fleet Manager reads.
const express = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const csrfProtection = require('../../middleware/csrf');
const { MODULES, ACTIONS } = require('../../constants/permissions');
const controller = require('./expense.controller');

const router = express.Router();
router.use(authenticate);

router.get('/', authorize(MODULES.EXPENSES, ACTIONS.READ), controller.list);
// Static routes before /:id so they aren't captured as an id.
router.get('/cost-summary', authorize(MODULES.EXPENSES, ACTIONS.READ), controller.costSummary);
router.get('/:id', authorize(MODULES.EXPENSES, ACTIONS.READ), controller.getById);
router.post('/', authorize(MODULES.EXPENSES, ACTIONS.CREATE), csrfProtection, controller.create);
router.put('/:id', authorize(MODULES.EXPENSES, ACTIONS.UPDATE), csrfProtection, controller.update);
router.delete('/:id', authorize(MODULES.EXPENSES, ACTIONS.DELETE), csrfProtection, controller.remove);

module.exports = router;
