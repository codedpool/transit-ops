// CSRF protection via the stateless double-submit-cookie pattern.
//
// On login the server issues two things: the HTTP-only JWT (which embeds a
// random `csrf` secret as a claim) and a readable `csrf_token` cookie holding
// the same value. For any state-changing request the client must echo that
// value in the `x-csrf-token` header. A forged cross-site request can send the
// cookies automatically but CANNOT read the readable cookie to set the header
// (same-origin policy), so it fails this check.
//
// Safe methods (GET/HEAD/OPTIONS) are exempt. Requires `authenticate` to have
// run first so `req.csrfToken` (from the signed JWT) is available.
const AppError = require('../utils/AppError');
const { CSRF_HEADER } = require('../constants/cookies');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

module.exports = function csrfProtection(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const headerToken = req.get(CSRF_HEADER);
  if (!headerToken || headerToken !== req.csrfToken) {
    return next(new AppError(403, 'Invalid or missing CSRF token.', 'CSRF_FAILED'));
  }
  next();
};
