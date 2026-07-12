// Auth routes: /api/auth/*
const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const authenticate = require('../../middleware/authenticate');
const csrfProtection = require('../../middleware/csrf');
const controller = require('./auth.controller');

const router = express.Router();

// Public: establish a session.
router.post('/login', asyncHandler(controller.login));

// Authenticated: who am I + what can I do.
router.get('/me', authenticate, asyncHandler(controller.me));

// Authenticated + CSRF-guarded (state-changing: clears the session cookies).
router.post('/logout', authenticate, csrfProtection, asyncHandler(controller.logout));

module.exports = router;
