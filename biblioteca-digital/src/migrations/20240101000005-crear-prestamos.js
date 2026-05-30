'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('prestamos', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      libro_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'libros',   key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // No borrar libro con préstamos activos
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      fecha_prestamo:             { type: Sequelize.DATEONLY, allowNull: false },
      fecha_devolucion_esperada:  { type: Sequelize.DATEONLY, allowNull: false },
      fecha_devolucion_real:      { type: Sequelize.DATEONLY, allowNull: true, defaultValue: null },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('prestamos', ['libro_id'],             { name: 'idx_prestamos_libro' });
    await queryInterface.addIndex('prestamos', ['usuario_id'],           { name: 'idx_prestamos_usuario' });
    await queryInterface.addIndex('prestamos', ['fecha_devolucion_real'],{ name: 'idx_prestamos_devolucion' });
    await queryInterface.addIndex('prestamos', ['libro_id', 'usuario_id'], { name: 'idx_prestamos_libro_usuario' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('prestamos');
  },
};
