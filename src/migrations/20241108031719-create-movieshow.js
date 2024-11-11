'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('movieshows', {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      movie_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'movies',
          key: 'id',
        },
      },
      theater_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'theaters',
          key: 'id',
        },
      },
      showtime: {
        type: Sequelize.ENUM('Morning', 'Afternoon', 'Evening', 'Night'),
        allowNull: false,
      },
      availableSeats: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM('2D', '3D', '4D'),
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('movieshows');
  },
};
