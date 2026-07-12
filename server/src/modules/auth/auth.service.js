// Auth service — password hashing, credential verification, and JWT/CSRF token
// minting. This is the reusable business layer; controllers only translate HTTP.
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const prisma = require('../../lib/prisma');
const AppError = require('../../utils/AppError');

const BCRYPT_ROUNDS = 12;

function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

// Verify email + password. Uses a constant-ish flow: always returns the same
// error whether the email is unknown or the password is wrong, so the endpoint
// does not leak which emails exist.
async function verifyCredentials(email, password) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  const invalid = new AppError(401, 'Invalid email or password.', 'INVALID_CREDENTIALS');
  if (!user) {
    // Still run a hash compare to blunt timing analysis.
    await bcrypt.compare(password, '$2a$12$0000000000000000000000000000000000000000000000000000');
    throw invalid;
  }
  if (!user.isActive) {
    throw new AppError(403, 'Your account has been deactivated.', 'ACCOUNT_INACTIVE');
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw invalid;

  return user;
}

// Mint a signed JWT carrying the user id, role, and a random CSRF secret.
// Returns { token, csrf } — token goes in the HTTP-only cookie, csrf in a
// readable cookie for the double-submit check.
function issueTokens(user) {
  const csrf = crypto.randomBytes(24).toString('hex');
  const token = jwt.sign(
    { sub: user.id, role: user.role.name, csrf },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
  return { token, csrf };
}

// Strip sensitive fields before returning a user over the API.
function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role ? user.role.name : undefined,
    isActive: user.isActive,
  };
}

module.exports = { hashPassword, verifyCredentials, issueTokens, toPublicUser };
