// Request schemas for the expenses module (zod).
const { z } = require('zod');
const { EXPENSE_CATEGORIES } = require('../../constants/enums');

const optionalId = z.preprocess(
  (v) => (v === '' || v == null ? undefined : v),
  z.coerce.number().int().positive('Invalid reference.').optional()
);

const dateField = z
  .string()
  .min(1, 'Date is required.')
  .refine((s) => !Number.isNaN(Date.parse(s)), 'Date is invalid.')
  .transform((s) => new Date(s));

const createExpenseSchema = z.object({
  vehicleId: z.coerce.number().int().positive('A vehicle is required.'),
  category: z.enum(EXPENSE_CATEGORIES, { message: 'Select a valid category.' }),
  amount: z.coerce.number().positive('Amount must be greater than 0.'),
  date: dateField,
  notes: z.string().trim().max(300).optional().or(z.literal('')),
  relatedTripId: optionalId,
});

const updateExpenseSchema = createExpenseSchema
  .partial()
  .refine((o) => Object.keys(o).length > 0, { message: 'No fields to update.' });

module.exports = { createExpenseSchema, updateExpenseSchema };
