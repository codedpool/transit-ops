// Dashboard routes: /api/dashboard/*
const express = require('express');
const controller = require('./dashboard.controller');

const router = express.Router();

// Read-only aggregates. Public for now so the Next.js server can render the
// dashboard before the client login UI exists.
// TODO: guard with `authenticate` + `authorize` once the client auth flow lands.
router.get('/summary', controller.summary);

module.exports = router;
