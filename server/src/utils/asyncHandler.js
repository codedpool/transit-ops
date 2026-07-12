// Wraps an async route handler so rejected promises reach Express's error
// middleware instead of crashing the process. Avoids try/catch in every controller.
module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
