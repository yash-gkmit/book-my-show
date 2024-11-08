'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bookings', {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      movieshow_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'movieshows',
          key: 'id',
        },
      },
      numberOfSeat: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      bookingStatus: {
        type: Sequelize.ENUM('Confirmed', 'Canceled'),
        defaultValue: 'Confirmed',
        allowNull: false,
      },
      totalAmount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        o,
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
        allowNull: true,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('bookings');
  },
};
