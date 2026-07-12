// Centralized configuration. Every secret / tunable is read from the environment
// here (never hard-coded elsewhere), so the rest of the app imports `env`.
require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}. See server/.env.example`);
  }
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  databaseUrl: required('DATABASE_URL'),

  // Auth
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  // Cookie lifetime in ms; keep roughly in sync with JWT_EXPIRES_IN.
  cookieMaxAgeMs: Number(process.env.COOKIE_MAX_AGE_MS) || 8 * 60 * 60 * 1000,

  // CORS — the Next.js client origin allowed to send credentialed requests.
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
};

env.isProd = env.nodeEnv === 'production';

module.exports = env;
