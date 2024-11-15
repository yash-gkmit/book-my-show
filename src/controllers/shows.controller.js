const showService = require('../services/shows.service');
const { responseHandler, errorHandler } = require('../helpers/common.helper');

const generate = async (req, res) => {
	try {
		const show = await showService.create(req.body);
		res.data = show;
		console.log(res.data);
		res.statusCode = 201;
		responseHandler(req, res);
	} catch (error) {
		console.log(error);
		errorHandler(req, res, error.message, error.statusCode || 400);
	}
};

module.exports = {
	generate,
};
