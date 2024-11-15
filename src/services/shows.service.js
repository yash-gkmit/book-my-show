const { Show, sequelize } = require('../models');

const create = async data => {
	const t = await sequelize.transaction();

	try {
		const show = await Show.create(data, { transaction: t });
		await t.commit();
		return show;
	} catch (error) {
		await t.rollback();
		throw error;
	}
};

module.exports = {
	create,
};
