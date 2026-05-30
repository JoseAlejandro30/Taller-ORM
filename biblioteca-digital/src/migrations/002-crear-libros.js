// src/migrations/002-crear-libros.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('libros', {
      id: {
        type:          Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey:    true,
      },
      titulo: {
        type:      Sequelize.DataTypes.STRING(200),
        allowNull: false,
      },
      isbn: {
        type:      Sequelize.DataTypes.STRING(20),
        allowNull: false,
        unique:    true,
      },
      anio_publicacion: {
        type:      Sequelize.DataTypes.INTEGER,
        allowNull: true,
      },
      copias_disponibles: {
        type:         Sequelize.DataTypes.INTEGER,
        allowNull:    false,
        defaultValue: 1,
      },
      activo: {
        type:         Sequelize.DataTypes.BOOLEAN,
        allowNull:    false,
        defaultValue: true,
      },
      createdAt: { type: Sequelize.DataTypes.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DataTypes.DATE, allowNull: false },
    });

    // Índices definidos explícitamente en la migración
    await queryInterface.addIndex('libros', ['isbn'],           { unique: true, name: 'idx_libros_isbn' });
    await queryInterface.addIndex('libros', ['activo', 'titulo'], { name: 'idx_libros_activo_titulo' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('libros');
  },
};
