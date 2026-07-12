// Dashboard routes: /api/dashboard/*
const express = require('express');
const authenticate = require('../../middleware/authenticate');
const controller = require('./dashboard.controller');

const router = express.Router();

// Read-only aggregates. Any authenticated user may view the dashboard.
router.get('/summary', authenticate, controller.summary);

module.exports = router;
