// Request schemas for the vehicles module. Centralized so controllers stay thin
// and validation messages are consistent. Rules also enforced at the DB level
// (unique registration, CHECK constraints) — this is the friendly first line.
const { z } = require('zod');
const { VEHICLE_TYPES, VEHICLE_STATUSES } = require('../../constants/enums');

const createVehicleSchema = z.object({
  registrationNumber: z
    .string()
    .trim()
    .min(1, 'Registration number is required.')
    .max(20, 'Registration number is too long.')
    .transform((s) => s.toUpperCase()),
  nameOrModel: z.string().trim().min(1, 'Name / model is required.'),
  type: z.enum(VEHICLE_TYPES, { message: 'Select a valid vehicle type.' }),
  maxLoadCapacity: z
    .number({ message: 'Max load capacity must be a number.' })
    .positive('Max load capacity must be greater than 0.'),
  odometer: z
    .number({ message: 'Odometer must be a number.' })
    .min(0, 'Odometer cannot be negative.')
    .default(0),
  acquisitionCost: z
    .number({ message: 'Acquisition cost must be a number.' })
    .min(0, 'Acquisition cost cannot be negative.')
    .default(0),
  status: z.enum(VEHICLE_STATUSES).default('AVAILABLE'),
  region: z.string().trim().max(60).optional().or(z.literal('')),
});

// Update: same shape, all optional (partial), but at least one field required.
const updateVehicleSchema = createVehicleSchema.partial().refine(
  (obj) => Object.keys(obj).length > 0,
  { message: 'No fields to update.' }
);

module.exports = { createVehicleSchema, updateVehicleSchema };
