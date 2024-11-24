'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('movies', 'category', {
      type: Sequelize.ENUM('U', 'U/A', 'A'),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('movies', 'category');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_movies_category";',
    );
  },
};
