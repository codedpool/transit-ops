// Request schema for the maintenance module (zod).
const { z } = require('zod');

const createMaintenanceSchema = z.object({
  vehicleId: z.coerce.number().int().positive('A vehicle is required.'),
  serviceType: z.string().trim().min(1, 'Service type is required.'),
  issueNotes: z.string().trim().optional(),
  cost: z.coerce.number().nonnegative('Cost cannot be negative.').optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED']).optional(),
  remarks: z.string().trim().optional(),
});

module.exports = { createMaintenanceSchema };
