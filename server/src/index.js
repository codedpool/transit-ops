// Server entry point. Boots the Express app and handles graceful shutdown.
const app = require('./app');
const env = require('./config/env');
const prisma = require('./lib/prisma');

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`TransitOps API listening on http://localhost:${env.port} (${env.nodeEnv})`);
});

async function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received — shutting down.`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
