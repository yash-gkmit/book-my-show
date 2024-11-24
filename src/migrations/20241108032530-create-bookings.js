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
      show_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'shows',
          key: 'id',
        },
      },
      number_of_seats: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      booking_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      booking_status: {
        type: Sequelize.ENUM('Confirmed', 'Pending', 'Canceled'),
        defaultValue: 'Pending',
        allowNull: false,
      },
      total_amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
