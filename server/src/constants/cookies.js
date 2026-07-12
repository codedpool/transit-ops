// Cookie names shared between auth service and middleware.
module.exports = Object.freeze({
  AUTH_COOKIE: 'token', // HTTP-only signed JWT
  CSRF_COOKIE: 'csrf_token', // readable double-submit token
  CSRF_HEADER: 'x-csrf-token', // header the client must echo on writes
});
