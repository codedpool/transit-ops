// API route map. Each module mounts its own router here under /api/<module>.
const express = require('express');
const authRoutes = require('./modules/auth/auth.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const vehicleRoutes = require('./modules/vehicles/vehicle.routes');
const driverRoutes = require('./modules/drivers/driver.routes');
const tripRoutes = require('./modules/trips/trips.routes');
const maintenanceRoutes = require('./modules/maintenance/maintenance.routes');
const fuelRoutes = require('./modules/fuel/fuel.routes');
const expenseRoutes = require('./modules/expenses/expense.routes');
const reportRoutes = require('./modules/reports/reports.routes');
const documentRoutes = require('./modules/documents/document.routes');

const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);
router.use('/trips', tripRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/fuel', fuelRoutes);
router.use('/expenses', expenseRoutes);
router.use('/reports', reportRoutes);
router.use('/documents', documentRoutes);

module.exports = router;
