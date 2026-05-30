const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Autor extends Model {}

  Autor.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: { msg: 'El nombre no puede estar vacío' } },
      },
      apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: { msg: 'El apellido no puede estar vacío' } },
      },
      nacionalidad: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Autor',
      tableName: 'autores',
      timestamps: true,
      indexes: [
        { fields: ['apellido'] },
        { fields: ['nombre', 'apellido'] },
      ],
    }
  );

  return Autor;
};
