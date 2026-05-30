const { Prestamo, Libro, Usuario } = require('../models');
const { Op } = require('sequelize');

class PrestamoRepository {
  async crear(datos, opciones = {}) {
    return Prestamo.create(datos, opciones);
  }

  async buscarActivos() {
    return Prestamo.findAll({
      where: { fecha_devolucion_real: null },
      include: [
        { model: Libro,    as: 'libro',   attributes: ['id', 'titulo', 'isbn'] },
        { model: Usuario,  as: 'usuario', attributes: ['id', 'nombre', 'email'] },
      ],
      order: [['fecha_devolucion_esperada', 'ASC']],
    });
  }

  async buscarPorId(id) {
    return Prestamo.findByPk(id, {
      include: [
        { model: Libro,   as: 'libro'   },
        { model: Usuario, as: 'usuario' },
      ],
    });
  }

  async registrarDevolucion(id, fecha, opciones = {}) {
    return Prestamo.update(
      { fecha_devolucion_real: fecha },
      { where: { id }, ...opciones }
    );
  }
}

module.exports = new PrestamoRepository();
