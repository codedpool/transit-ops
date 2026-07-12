// Request schemas for the drivers module.
const { z } = require('zod');
const { DRIVER_STATUSES } = require('../../constants/enums');

const createDriverSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  licenseNumber: z
    .string()
    .trim()
    .min(1, 'License number is required.')
    .max(30, 'License number is too long.')
    .transform((s) => s.toUpperCase()),
  licenseCategory: z.string().trim().min(1, 'License category is required.'),
  licenseExpiryDate: z
    .string()
    .min(1, 'License expiry date is required.')
    .refine((s) => !Number.isNaN(Date.parse(s)), 'License expiry date is invalid.')
    .transform((s) => new Date(s)),
  contactNumber: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s-]{7,20}$/, 'Enter a valid contact number (7–20 digits).'),
  safetyScore: z
    .number({ message: 'Safety score must be a number.' })
    .min(0, 'Safety score cannot be below 0.')
    .max(100, 'Safety score cannot exceed 100.')
    .default(100),
  status: z.enum(DRIVER_STATUSES).default('AVAILABLE'),
  region: z.string().trim().max(60).optional().or(z.literal('')),
});

const updateDriverSchema = createDriverSchema.partial().refine(
  (obj) => Object.keys(obj).length > 0,
  { message: 'No fields to update.' }
);

module.exports = { createDriverSchema, updateDriverSchema };
