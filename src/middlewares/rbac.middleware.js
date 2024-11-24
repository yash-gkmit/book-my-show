const { errorHandler } = require('../helpers/common.helper');

exports.rbacMiddleware = (allowedRoles, allowSelf) => {
  return (req, res, next) => {
    const { user } = req;
    const userRoles = user.roles || [];
    const userIdFromParams = req.params.id;

    if (allowSelf && user.id === userIdFromParams) {
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

    errorHandler(
      req,
      res,
      'You are not authorized to access this resource!',
      403,
    );
  };
};
