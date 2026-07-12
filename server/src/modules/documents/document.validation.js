// Request schema for vehicle documents (zod).
const { z } = require('zod');

const optionalDate = z.preprocess(
  (v) => (v === '' || v == null ? undefined : v),
  z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), 'Date is invalid.')
    .transform((s) => new Date(s))
    .optional()
);

const createDocumentSchema = z.object({
  vehicleId: z.coerce.number().int().positive('A vehicle is required.'),
  title: z.string().trim().min(1, 'Title is required.'),
  docType: z.string().trim().min(1, 'Document type is required.'),
  referenceNumber: z.string().trim().max(120).optional().or(z.literal('')),
  fileUrl: z.string().trim().url('Must be a valid URL.').optional().or(z.literal('')),
  expiryDate: optionalDate,
});

module.exports = { createDocumentSchema };
