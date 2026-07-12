// Enum value lists mirroring the Prisma schema. Single source of truth for
// validation and any server-side option lists. Keep in sync with schema.prisma.
const VEHICLE_TYPES = ['TRUCK', 'VAN', 'MINI', 'CAR', 'BUS', 'TRAILER', 'PICKUP', 'OTHER'];
const VEHICLE_STATUSES = ['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED'];
const DRIVER_STATUSES = ['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED'];
const TRIP_STATUSES = ['DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'];
const MAINTENANCE_STATUSES = ['OPEN', 'IN_PROGRESS', 'COMPLETED'];
const EXPENSE_CATEGORIES = ['TOLL', 'MAINTENANCE', 'PARKING', 'INSURANCE', 'FINE', 'OTHER'];

module.exports = {
  VEHICLE_TYPES,
  VEHICLE_STATUSES,
  DRIVER_STATUSES,
  TRIP_STATUSES,
  MAINTENANCE_STATUSES,
  EXPENSE_CATEGORIES,
};
