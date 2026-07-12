// Request schemas for the trips module (zod).
const { z } = require('zod');

const createTripSchema = z.object({
  source: z.string().trim().min(1, 'Source is required.'),
  destination: z.string().trim().min(1, 'Destination is required.'),
  vehicleId: z.coerce.number().int().positive('A vehicle is required.'),
  driverId: z.coerce.number().int().positive('A driver is required.'),
  cargoWeight: z.coerce.number().positive('Cargo weight must be greater than 0.'),
  plannedDistance: z.coerce.number().nonnegative('Planned distance cannot be negative.'),
});

const completeTripSchema = z.object({
  finalOdometer: z.coerce.number().nonnegative('Final odometer is required.'),
  fuelConsumed: z.coerce.number().positive('Fuel consumed must be greater than 0.'),
});

const cancelTripSchema = z.object({
  reason: z.string().trim().min(1, 'A cancellation reason is required.'),
});

module.exports = { createTripSchema, completeTripSchema, cancelTripSchema };
