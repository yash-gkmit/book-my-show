'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Movieshow extends Model {
    static associate(models) {
      Movieshow.belongsTo(models.Movie, {
        foreignKey: 'movie_id',
        as: 'movie',
      });

      Movieshow.belongsTo(models.Theater, {
        foreignKey: 'theater_id',
        as: 'theater',
      });
    }
  }
  Movieshow.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      movie_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      theater_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      showtime: {
        type: DataTypes.ENUM('Morning', 'Afternoon', 'Evening', 'Night'),
        allowNull: false,
      },
      availableSeats: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM('2D', '3D', '4D'),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Movieshow',
      tableName: 'movieshows',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    },
  );

  return Movieshow;
};
