// Request schemas for the auth module. Centralizing validation here (zod) keeps
// controllers thin and error messages consistent.
const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email is required.'),
  password: z.string().min(1, 'Password is required.'),
});

module.exports = { loginSchema };
