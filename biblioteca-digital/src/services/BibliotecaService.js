/**
 * BibliotecaService
 * Capa de servicio con las 5 operaciones requeridas (R4).
 * Todas las operaciones que modifican múltiples tablas usan transacciones (R5).
 */
const { sequelize, Libro, Autor } = require('../models');
const LibroRepo    = require('../repositories/LibroRepository');
const PrestamoRepo = require('../repositories/PrestamoRepository');

class BibliotecaService {

  // ──────────────────────────────────────────────────────────────
  // R4-1: Registrar un libro con sus autores
  // ──────────────────────────────────────────────────────────────
  async registrarLibro({ titulo, isbn, anio_publicacion, copias_disponibles, autorIds }) {
    const t = await sequelize.transaction();
    try {
      // Validar ISBN único antes de intentar insertar
      const existente = await Libro.findOne({ where: { isbn }, transaction: t });
      if (existente) throw new Error(`Ya existe un libro con ISBN ${isbn}`);

      const libro = await Libro.create(
        { titulo, isbn, anio_publicacion, copias_disponibles },
        { transaction: t }
      );

      if (autorIds && autorIds.length > 0) {
        const autores = await Autor.findAll({ where: { id: autorIds }, transaction: t });
        if (autores.length !== autorIds.length) throw new Error('Uno o más autores no existen');
        await libro.setAutores(autores, { transaction: t });
      }

      await t.commit();
      return await LibroRepo.buscarPorId(libro.id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // ──────────────────────────────────────────────────────────────
  // R4-2: Listar libros activos con sus autores (sin N+1)
  // ──────────────────────────────────────────────────────────────
  async listarLibrosActivos() {
    // Una sola query con JOIN gracias al include eager
    return LibroRepo.listarActivos();
  }

  // ──────────────────────────────────────────────────────────────
  // R4-3: Registrar un préstamo (con transacción y validaciones)
  // ──────────────────────────────────────────────────────────────
  async registrarPrestamo({ libro_id, usuario_id, fecha_devolucion_esperada }) {
    const t = await sequelize.transaction();
    try {
      // R6: Verificar que el libro exista, esté activo y tenga copias
      const libro = await Libro.findByPk(libro_id, { transaction: t, lock: true });
      if (!libro)         throw new Error('Libro no encontrado');
      if (!libro.activo)  throw new Error('El libro no está disponible para préstamo');
      if (libro.copias_disponibles <= 0)
        throw new Error(`Sin copias disponibles de "${libro.titulo}"`);

      const fecha_prestamo = new Date().toISOString().split('T')[0];

      const prestamo = await PrestamoRepo.crear(
        { libro_id, usuario_id, fecha_prestamo, fecha_devolucion_esperada },
        { transaction: t }
      );

      // R5: Si falla el decremento, rollback automático en el catch
      await LibroRepo.decrementarCopias(libro_id, { transaction: t });

      await t.commit();
      return await PrestamoRepo.buscarPorId(prestamo.id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // ──────────────────────────────────────────────────────────────
  // R4-4: Registrar la devolución (con transacción)
  // ──────────────────────────────────────────────────────────────
  async registrarDevolucion(prestamo_id) {
    const t = await sequelize.transaction();
    try {
      const prestamo = await PrestamoRepo.buscarPorId(prestamo_id);
      if (!prestamo) throw new Error('Préstamo no encontrado');
      if (prestamo.fecha_devolucion_real)
        throw new Error('Este préstamo ya fue devuelto');

      const hoy = new Date().toISOString().split('T')[0];

      await PrestamoRepo.registrarDevolucion(prestamo_id, hoy, { transaction: t });

      // R5: Restablecer las copias. Si falla → rollback.
      await LibroRepo.incrementarCopias(prestamo.libro_id, { transaction: t });

      await t.commit();
      return await PrestamoRepo.buscarPorId(prestamo_id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // ──────────────────────────────────────────────────────────────
  // R4-5: Consultar préstamos activos (sin fecha de devolución real)
  // ──────────────────────────────────────────────────────────────
  async consultarPrestamosActivos() {
    return PrestamoRepo.buscarActivos();
  }
}

module.exports = new BibliotecaService();
