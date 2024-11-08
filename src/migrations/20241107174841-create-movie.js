'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('movies', {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      summary: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      releaseDate: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      castMemberList: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
      genre: {
        type: Sequelize.ENUM(
          'Action',
          'Comedy',
          'Drama',
          'Horror',
          'Sci-Fi',
          'Romance',
        ),
        allowNull: false,
      },
      language: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      poster: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      trailer: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('movies');
  },
};
