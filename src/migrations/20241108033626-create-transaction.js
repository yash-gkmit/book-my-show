'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      booking_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'bookings',
          key: 'id',
        },
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      transactionStatus: {
        type: Sequelize.ENUM('Success', 'Failed'),
        allowNull: false,
      },
      transactionDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      transactionAmount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      GST: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 18.0,
        allowNull: false,
      },
      CGST: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 9.0,
        allowNull: false,
      },
      IGST: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 18.0,
        allowNull: false,
      },
      SGST: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 9.0,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('transactions');
  },
};
