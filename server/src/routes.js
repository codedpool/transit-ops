// API route map. Each module mounts its own router here under /api/<module>.
// As modules land (vehicles, drivers, trips, ...) add one line each.
const express = require('express');
const authRoutes = require('./modules/auth/auth.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
// router.use('/vehicles', vehicleRoutes);   // added in the vehicles phase
// router.use('/drivers', driverRoutes);      // added in the drivers phase
// ... trips, maintenance, fuel, expenses, reports

module.exports = router;
