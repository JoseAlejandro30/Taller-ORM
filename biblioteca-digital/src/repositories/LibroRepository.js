const { Libro, Autor, Prestamo } = require('../models');
const { Op } = require('sequelize');

class LibroRepository {
  async crear(datos) {
    return Libro.create(datos);
  }

  async buscarPorId(id) {
    return Libro.findByPk(id, {
      include: [{ model: Autor, as: 'autores', through: { attributes: [] } }],
    });
  }

  async listarActivos() {
    // EAGER con include explícito → evita N+1
    return Libro.findAll({
      where: { activo: true },
      include: [{ model: Autor, as: 'autores', through: { attributes: [] } }],
      order: [['titulo', 'ASC']],
    });
  }

  async actualizar(id, datos) {
    return Libro.update(datos, { where: { id } });
  }

  async decrementarCopias(id, opciones = {}) {
    return Libro.decrement('copias_disponibles', { by: 1, where: { id }, ...opciones });
  }

  async incrementarCopias(id, opciones = {}) {
    return Libro.increment('copias_disponibles', { by: 1, where: { id }, ...opciones });
  }
}

module.exports = new LibroRepository();
