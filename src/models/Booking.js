'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });

      Booking.belongsTo(models.Movieshow, {
        foreignKey: 'movieshow_id',
        as: 'movieshow',
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
      movieshow_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      numberOfSeat: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      bookingStatus: {
        type: DataTypes.ENUM('Confirmed', 'Canceled'),
        defaultValue: 'Confirmed',
        allowNull: false,
      },
      totalAmount: {
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
