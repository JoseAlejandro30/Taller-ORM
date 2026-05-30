const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Prestamo = sequelize.define(
    'Prestamo',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      libro_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'libros', key: 'id' },
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
      },
      fecha_prestamo: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      fecha_devolucion_esperada: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isAfterPrestamo(value) {
            if (value <= this.fecha_prestamo) {
              throw new Error('La fecha de devolución debe ser posterior al préstamo');
            }
          },
        },
      },
      fecha_devolucion_real: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: 'prestamos',
      timestamps: true,
      indexes: [
        { fields: ['libro_id'] },
        { fields: ['usuario_id'] },
        { fields: ['fecha_devolucion_real'] }, // para consultar activos (null)
        { fields: ['libro_id', 'usuario_id'] },
      ],
    }
  );

  return Prestamo;
};
