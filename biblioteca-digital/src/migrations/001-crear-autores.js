// src/migrations/001-crear-autores.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('autores', {
      id: {
        type:          Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey:    true,
      },
      nombre: {
        type:      Sequelize.DataTypes.STRING(100),
        allowNull: false,
      },
      apellido: {
        type:      Sequelize.DataTypes.STRING(100),
        allowNull: false,
      },
      nacionalidad: {
        type:      Sequelize.DataTypes.STRING(80),
        allowNull: true,
      },
      createdAt: { type: Sequelize.DataTypes.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DataTypes.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('autores');
  },
};
