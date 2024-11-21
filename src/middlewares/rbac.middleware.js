const { throwCustomError } = require('../helpers/common.helper');

exports.rbacMiddleware = allowedRoles => {
  return (req, res, next) => {
    const { user } = req;
    const userRoles = user.roles || [];
    const userIdFromParams = req.params.user_id;

    if (userRoles.includes('Admin')) {
      console.log('Admin access granted.');
      return next();
    }

    if (allowedRoles.includes('self') && user.user_id === userIdFromParams) {
      console.log('Self access granted.');
      return next();
    }

    const hasAllowedRole = userRoles.some(role => allowedRoles.includes(role));
    if (hasAllowedRole) {
      console.log('Role access granted.');
      return next();
    }

    if (user.selectedRole && allowedRoles.includes(user.selectedRole)) {
      console.log('Selected Role access granted.');
      return next();
    }

    throwCustomError(
      'Forbidden: You do not have permission to access this resource',
      403,
    );
  };
};
