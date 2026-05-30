// src/migrations/004-crear-usuarios.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id: {
        type:          Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey:    true,
      },
      nombre: {
        type:      Sequelize.DataTypes.STRING(150),
        allowNull: false,
      },
      email: {
        type:      Sequelize.DataTypes.STRING(200),
        allowNull: false,
        unique:    true,
      },
      activo: {
        type:         Sequelize.DataTypes.BOOLEAN,
        allowNull:    false,
        defaultValue: true,
      },
      createdAt: { type: Sequelize.DataTypes.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DataTypes.DATE, allowNull: false },
    });

    await queryInterface.addIndex('usuarios', ['email'], {
      unique: true,
      name:   'idx_usuarios_email',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('usuarios');
  },
};
