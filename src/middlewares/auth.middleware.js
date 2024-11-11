const { throwCustomError } = require('../helpers/common.helper');
const { isTokenBlacklisted } = require('../helpers/redis.helper');
const { verifyToken } = require('../helpers/jwt.helper');

exports.authMiddleware = async (req, res, next) => {
	const token = req.headers['authorization']?.split(' ')[1];

	if (!token) {
		throwCustomError('Token is required', 401);
	}

	try {
		const isBlacklisted = await isTokenBlacklisted(token);
		if (isBlacklisted) {
			throwCustomError('Token is blacklisted', 401);
		}

		const decoded = await verifyToken(token);
		req.user = decoded;
		next();
	} catch (error) {
		console.log(error);
		throwCustomError('Unauthorized', 401);
	}
};
