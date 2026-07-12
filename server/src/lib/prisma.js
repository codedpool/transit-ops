// Single shared PrismaClient instance (data-access layer).
// One instance per process avoids exhausting the DB connection pool.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
