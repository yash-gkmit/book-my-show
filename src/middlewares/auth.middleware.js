const { throwCustomError, errorHandler } = require('../helpers/common.helper');
const { isTokenBlacklisted } = require('../helpers/redis.helper');
const { verifyToken } = require('../helpers/jwt.helper');
const { User, Role } = require('../models');

exports.authMiddleware = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  try {
    if (!token) {
      throwCustomError('Token is required', 401);
    }

    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      throwCustomError('Token is blacklisted', 401);
    }

    const decoded = await verifyToken(token);

    const user = await User.findByPk(decoded.id, {
      include: { model: Role, through: { attributes: [] }, required: true },
    });

    if (!user) {
      return throwCustomError('user Not Found', 404);
    }

    req.user = user;
    req.user.roles = user.Roles.map(role => role.name);

    next();
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, error.statusCode);
  }
};
