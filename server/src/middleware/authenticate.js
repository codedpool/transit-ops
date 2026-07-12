// Authentication guard. Verifies the JWT carried in the HTTP-only `token`
// cookie, reloads the user fresh from the DB (so deactivation / role changes
// take effect immediately), and attaches `req.user` + `req.csrfToken`.
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { AUTH_COOKIE } = require('../constants/cookies');

module.exports = async function authenticate(req, res, next) {
  try {
    const token = req.cookies && req.cookies[AUTH_COOKIE];
    if (!token) {
      throw new AppError(401, 'Authentication required. Please log in.', 'NOT_AUTHENTICATED');
    }

    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch (err) {
      throw new AppError(401, 'Session expired or invalid. Please log in again.', 'INVALID_TOKEN');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'Account not found or deactivated.', 'ACCOUNT_INACTIVE');
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name, // RoleName enum string
      roleId: user.roleId,
    };
    // CSRF secret bound inside the signed token (double-submit — see csrf.js).
    req.csrfToken = payload.csrf;
    next();
  } catch (err) {
    next(err);
  }
};
