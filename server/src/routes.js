// API route map. Each module mounts its own router here under /api/<module>.
// As modules land (vehicles, drivers, trips, ...) add one line each.
const express = require('express');
const authRoutes = require('./modules/auth/auth.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const vehicleRoutes = require('./modules/vehicles/vehicle.routes');
const driverRoutes = require('./modules/drivers/driver.routes');
const tripRoutes = require('./modules/trips/trips.routes');

const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);
router.use('/trips', tripRoutes);
// ... maintenance, fuel, expenses, reports

module.exports = router;
