// src/migrations/005-crear-prestamos.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('prestamos', {
      id: {
        type:          Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey:    true,
      },
      libro_id: {
        type:       Sequelize.DataTypes.INTEGER,
        allowNull:  false,
        references: { model: 'libros',    key: 'id' },
        onDelete:   'RESTRICT', // No borrar libro si tiene préstamos
      },
      usuario_id: {
        type:       Sequelize.DataTypes.INTEGER,
        allowNull:  false,
        references: { model: 'usuarios',  key: 'id' },
        onDelete:   'RESTRICT',
      },
      fecha_prestamo: {
        type:      Sequelize.DataTypes.DATEONLY,
        allowNull: false,
      },
      fecha_devolucion_esperada: {
        type:      Sequelize.DataTypes.DATEONLY,
        allowNull: false,
      },
      fecha_devolucion_real: {
        type:      Sequelize.DataTypes.DATEONLY,
        allowNull: true, // NULL = préstamo activo
      },
      createdAt: { type: Sequelize.DataTypes.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DataTypes.DATE, allowNull: false },
    });

    // Índices en FKs (PostgreSQL no los crea automáticamente — checklist 8.7)
    await queryInterface.addIndex('prestamos', ['libro_id'],             { name: 'idx_prestamos_libro_id' });
    await queryInterface.addIndex('prestamos', ['usuario_id'],           { name: 'idx_prestamos_usuario_id' });
    await queryInterface.addIndex('prestamos', ['fecha_devolucion_real'],{ name: 'idx_prestamos_devolucion_real' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('prestamos');
  },
};
