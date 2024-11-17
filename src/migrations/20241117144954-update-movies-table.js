'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('movies', 'category', {
      type: Sequelize.ENUM('U', 'U/A', 'A'),
      allowNull: true,
    });

    await Promise.all([
      queryInterface.changeColumn('movies', 'name', {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('movies', 'category');

    await Promise.all([
      queryInterface.changeColumn('movies', 'name', {
        type: Sequelize.STRING(150),
        allowNull: false,
      }),
    ]);

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_movies_category";',
    );
  },
};
