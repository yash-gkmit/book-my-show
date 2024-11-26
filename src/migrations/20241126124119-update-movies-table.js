'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('movies', 'deleted_at_temp', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE "movies"
      SET "deleted_at_temp" = CASE
        WHEN "deleted_at" = TRUE THEN CURRENT_TIMESTAMP
        ELSE NULL
      END
    `);

    await queryInterface.removeColumn('movies', 'deleted_at');

    await queryInterface.renameColumn(
      'movies',
      'deleted_at_temp',
      'deleted_at',
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      'movies',
      'deleted_at',
      'deleted_at_temp',
    );

    await queryInterface.addColumn('movies', 'deleted_at', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE "movies"
      SET "deleted_at" = CASE
        WHEN "deleted_at_temp" IS NOT NULL THEN TRUE
        ELSE FALSE
      END
    `);

    await queryInterface.removeColumn('movies', 'deleted_at_temp');
  },
};
