// Auth controllers — translate HTTP <-> the auth service. Cookies are set/cleared
// here since that is transport concern, not business logic.
const env = require('../../config/env');
const authService = require('./auth.service');
const { loginSchema } = require('./auth.validation');
const { hasPermission, PERMISSIONS } = require('../../constants/permissions');
const { AUTH_COOKIE, CSRF_COOKIE } = require('../../constants/cookies');

// Shared cookie options. `token` is HTTP-only (JS can't read it); `csrf_token`
// is deliberately readable so the client can echo it back in a header.
function authCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd, // HTTPS-only in production
    sameSite: 'strict', // primary CSRF mitigation; double-submit is defense-in-depth
    maxAge: env.cookieMaxAgeMs,
    path: '/',
  };
}

function csrfCookieOptions() {
  return { ...authCookieOptions(), httpOnly: false };
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = loginSchema.parse(req.body);
  const user = await authService.verifyCredentials(email, password);
  const { token, csrf } = authService.issueTokens(user);

  res.cookie(AUTH_COOKIE, token, authCookieOptions());
  res.cookie(CSRF_COOKIE, csrf, csrfCookieOptions());

  res.json({
    user: authService.toPublicUser(user),
    csrfToken: csrf, // also returned so a non-cookie client can store it
  });
}

// POST /api/auth/logout
async function logout(req, res) {
  res.clearCookie(AUTH_COOKIE, { path: '/' });
  res.clearCookie(CSRF_COOKIE, { path: '/' });
  res.json({ message: 'Logged out.' });
}

// GET /api/auth/me — current user + the permission map the UI uses to show/hide.
async function me(req, res) {
  res.json({
    user: req.user,
    permissions: PERMISSIONS[req.user.role] || {},
  });
}

module.exports = { login, logout, me, hasPermission };
