// Request schemas for the fuel-log module (zod).
const { z } = require('zod');

// Optional foreign key: treat "" / null as "not linked".
const optionalId = z.preprocess(
  (v) => (v === '' || v == null ? undefined : v),
  z.coerce.number().int().positive('Invalid reference.').optional()
);

const dateField = z
  .string()
  .min(1, 'Date is required.')
  .refine((s) => !Number.isNaN(Date.parse(s)), 'Date is invalid.')
  .transform((s) => new Date(s));

const createFuelSchema = z.object({
  vehicleId: z.coerce.number().int().positive('A vehicle is required.'),
  liters: z.coerce.number().positive('Liters must be greater than 0.'),
  cost: z.coerce.number().nonnegative('Cost cannot be negative.'),
  date: dateField,
  odometerReading: z.preprocess(
    (v) => (v === '' || v == null ? undefined : v),
    z.coerce.number().nonnegative('Odometer cannot be negative.').optional()
  ),
  relatedTripId: optionalId,
});

const updateFuelSchema = createFuelSchema
  .partial()
  .refine((o) => Object.keys(o).length > 0, { message: 'No fields to update.' });

module.exports = { createFuelSchema, updateFuelSchema };
