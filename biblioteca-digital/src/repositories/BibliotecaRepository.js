// src/repositories/BibliotecaRepository.js
// ──────────────────────────────────────────────────────────────────────────────
// Patrón Repository (sección 7.5 del curso)
// Toda lógica de consulta vive aquí; el servicio solo llama al repositorio.
// ──────────────────────────────────────────────────────────────────────────────
const { Op }                           = require('sequelize');
const { Libro, Autor, Usuario, Prestamo } = require('../models');

class BibliotecaRepository {

  // ── Libros ──────────────────────────────────────────────────────────────────

  async crearLibro(data, autoresIds, transaction) {
    const libro = await Libro.create(data, { transaction });
    if (autoresIds && autoresIds.length > 0) {
      await libro.addAutores(autoresIds, { transaction });
    }
    return libro;
  }

  /**
   * Listado de libros activos con sus autores — EAGER LOADING explícito.
   * Un solo JOIN: previene el problema N+1 al iterar la colección.
   */
  async listarLibrosActivos() {
    return Libro.findAll({
      where:   { activo: true },
      include: [{ model: Autor, as: 'autores', through: { attributes: [] } }],
      order:   [['titulo', 'ASC']],
    });
  }

  async findLibroById(id, transaction = null) {
    return Libro.findByPk(id, { transaction });
  }

  // ── Autores ─────────────────────────────────────────────────────────────────

  async crearAutor(data) {
    return Autor.create(data);
  }

  async findAutoresByIds(ids) {
    return Autor.findAll({ where: { id: { [Op.in]: ids } } });
  }

  // ── Usuarios ────────────────────────────────────────────────────────────────

  async crearUsuario(data) {
    return Usuario.create(data);
  }

  async findUsuarioById(id) {
    return Usuario.findByPk(id);
  }

  // ── Préstamos ────────────────────────────────────────────────────────────────

  async crearPrestamo(data, transaction) {
    return Prestamo.create(data, { transaction });
  }

  async findPrestamoById(id, transaction = null) {
    return Prestamo.findByPk(id, {
      include: [
        { model: Libro,   as: 'libro'   },
        { model: Usuario, as: 'usuario' },
      ],
      transaction,
    });
  }

  /**
   * Préstamos activos: fecha_devolucion_real IS NULL
   * EAGER: incluye libro y usuario en un solo query con JOIN (sin N+1)
   */
  async listarPrestamosActivos() {
    return Prestamo.findAll({
      where: { fecha_devolucion_real: null },
      include: [
        { model: Libro,   as: 'libro',   attributes: ['id', 'titulo', 'isbn'] },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email'] },
      ],
      order: [['fecha_devolucion_esperada', 'ASC']],
    });
  }

  async actualizarPrestamo(id, data, transaction) {
    return Prestamo.update(data, { where: { id }, transaction });
  }

  async decrementarCopias(libroId, transaction) {
    return Libro.decrement('copias_disponibles', {
      by:          1,
      where:       { id: libroId },
      transaction,
    });
  }

  async incrementarCopias(libroId, transaction) {
    return Libro.increment('copias_disponibles', {
      by:          1,
      where:       { id: libroId },
      transaction,
    });
  }
}

module.exports = new BibliotecaRepository();
