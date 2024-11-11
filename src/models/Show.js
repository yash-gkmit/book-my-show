'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Show extends Model {
    static associate(models) {
      Show.belongsTo(models.Movie, {
        foreignKey: 'movie_id',
        as: 'movie',
      });

      Show.belongsTo(models.Theater, {
        foreignKey: 'theater_id',
        as: 'theater',
      });
    }
  }
  Show.init(
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
      show_time: {
        type: DataTypes.ENUM('Morning', 'Afternoon', 'Evening', 'Night'),
        allowNull: false,
      },
      available_seats: {
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
      modelName: 'Show',
      tableName: 'shows',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    },
  );

  return Show;
};
