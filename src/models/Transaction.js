'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      Transaction.belongsTo(models.Booking, {
        foreignKey: 'booking_id',
        as: 'booking',
      });

      Transaction.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
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
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('Success', 'Pending', 'Failed'),
        allowNull: true,
        defaultValue: 'Pending',
      },
      amount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      GST: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      CGST: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      IGST: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      SGST: {
        type: DataTypes.DECIMAL,
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
