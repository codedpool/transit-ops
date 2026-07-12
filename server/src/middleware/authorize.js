// RBAC guard factory. Use after `authenticate`:
//   router.post('/', authorize(MODULES.VEHICLES, ACTIONS.CREATE), controller.create)
// Denies with 403 when the authenticated user's role lacks the permission.
const AppError = require('../utils/AppError');
const { hasPermission } = require('../constants/permissions');

module.exports = function authorize(module, action) {
  return function (req, res, next) {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required.', 'NOT_AUTHENTICATED'));
    }
    if (!hasPermission(req.user.role, module, action)) {
      return next(
        new AppError(
          403,
          `Your role (${req.user.role}) is not permitted to ${action} ${module}.`,
          'FORBIDDEN'
        )
      );
    }
    next();
  };
};
