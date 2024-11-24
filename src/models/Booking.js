'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });

      Booking.belongsTo(models.Show, {
        foreignKey: 'show_id',
        as: 'show',
      });

      Booking.hasMany(models.Transaction, {
        foreignKey: 'booking_id',
        as: 'transaction',
      });
    }
  }
  Booking.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      show_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      number_of_seats: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      booking_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      booking_status: {
        type: DataTypes.ENUM('Confirmed', 'Pending', 'Canceled'),
        defaultValue: 'Pending',
        allowNull: false,
      },
      total_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Booking',
      tableName: 'bookings',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    },
  );

  return Booking;
};
