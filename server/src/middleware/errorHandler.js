// Central error handler — the single place that turns any thrown error into a
// consistent JSON shape: { error: { message, code } }. Keeps controllers clean
// and guarantees uniform error responses across every module.
const { ZodError } = require('zod');
const { Prisma } = require('@prisma/client');
const env = require('../config/env');
const AppError = require('../utils/AppError');

// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  // Request-body validation errors from zod.
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: {
        message: 'Validation failed.',
        code: 'VALIDATION_ERROR',
        details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      },
    });
  }

  // Known Prisma errors → friendly messages (e.g. unique constraint).
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
      return res.status(409).json({
        error: { message: `A record with this ${target} already exists.`, code: 'DUPLICATE' },
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Record not found.', code: 'NOT_FOUND' } });
    }
    if (err.code === 'P2003') {
      return res.status(409).json({
        error: {
          message: 'Cannot delete: this record is still referenced by other records.',
          code: 'IN_USE',
        },
      });
    }
  }

  // onDelete: Restrict raises Postgres 23001 (restrict_violation), which Prisma
  // surfaces as an "unknown" error rather than P2003 — treat it as in-use too.
  if (
    err instanceof Prisma.PrismaClientUnknownRequestError &&
    /violates RESTRICT|foreign key constraint/i.test(err.message)
  ) {
    return res.status(409).json({
      error: {
        message: 'Cannot delete: this record is still referenced by other records.',
        code: 'IN_USE',
      },
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { message: err.message, code: err.code },
    });
  }

  // Unknown / programming error — log server-side, return generic 500.
  // eslint-disable-next-line no-console
  console.error('[unhandled error]', err);
  return res.status(500).json({
    error: {
      message: 'Something went wrong.',
      code: 'INTERNAL_ERROR',
      ...(env.isProd ? {} : { debug: err.message }),
    },
  });
};
