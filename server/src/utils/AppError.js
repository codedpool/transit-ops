// Operational error with an HTTP status code. Thrown from services/controllers
// and translated to a consistent JSON body by the central error handler.
class AppError extends Error {
  constructor(statusCode, message, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || undefined;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
