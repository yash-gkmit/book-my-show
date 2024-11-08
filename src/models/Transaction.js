'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      Transaction.belongsTo(models.Booking, {
        foreignKey: 'booking_id',
        as: 'booking',
      });
    }
  }
  Transaction.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      booking_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      transactionStatus: {
        type: DataTypes.ENUM('Success', 'Failed'),
        allowNull: false,
      },
      transactionDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      transactionAmount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      GST: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      CGST: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      IGST: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      SGST: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Transaction',
      tableName: 'transactions',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    },
  );
  return Transaction;
};
