/**
 * demo.js — Script de demostración del sistema de Biblioteca Digital.
 * Ejecuta las 5 operaciones del R4 y muestra los resultados en consola.
 */
process.env.NODE_ENV = 'development';
const { sequelize } = require('./models');
const servicio = require('./services/BibliotecaService');

const sep = (titulo) => console.log('\n' + '═'.repeat(60) + '\n  ' + titulo + '\n' + '═'.repeat(60));
const ok  = (msg, data) => { console.log('✅ ' + msg); if (data) console.log(JSON.stringify(data, null, 2)); };
const err = (msg, e)    => console.log('❌ ' + msg + ':', e.message);

async function main() {
  try {
    await sequelize.authenticate();
    console.log('🔗 Conectado a la base de datos SQLite\n');

    // ── 1. Registrar un libro nuevo con autores ─────────────────
    sep('R4-1 | Registrar libro con autores');
    try {
      const libro = await servicio.registrarLibro({
        titulo: 'Rayuela',
        isbn: '978-0-394-72503-0',
        anio_publicacion: 1963,
        copias_disponibles: 3,
        autorIds: [3], // Borges (ya en la BD)
      });
      ok(`Libro creado: "${libro.titulo}" (id=${libro.id})`, {
        titulo: libro.titulo,
        isbn: libro.isbn,
        autores: libro.autores.map(a => `${a.nombre} ${a.apellido}`),
      });
    } catch (e) { err('No se pudo crear el libro', e); }

    // ── 2. Listar libros activos con autores ─────────────────────
    sep('R4-2 | Listar libros activos con autores (sin N+1)');
    const libros = await servicio.listarLibrosActivos();
    ok(`${libros.length} libros encontrados`);
    libros.forEach(l => {
      const autores = l.autores.map(a => `${a.nombre} ${a.apellido}`).join(', ');
      console.log(`   📖 [${l.copias_disponibles} cop.] ${l.titulo} — Autor(es): ${autores}`);
    });

    // ── 3. Registrar un préstamo ──────────────────────────────────
    sep('R4-3 | Registrar préstamo');
    let prestamoId;
    try {
      const en10 = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0];
      const prestamo = await servicio.registrarPrestamo({
        libro_id: 3,   // La casa de los espiritus (4 copias)
        usuario_id: 1,
        fecha_devolucion_esperada: en10,
      });
      prestamoId = prestamo.id;
      ok(`Préstamo registrado (id=${prestamo.id}): "${prestamo.libro.titulo}" → ${prestamo.usuario.nombre}`);
      console.log(`   📅 Devolución esperada: ${prestamo.fecha_devolucion_esperada}`);
    } catch (e) { err('No se pudo registrar el préstamo', e); }

    // ── Intento de préstamo inválido (sin copias) ─────────────────
    sep('R4-3 | Intento de préstamo sin copias (R6 validación)');
    try {
      const en5 = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];
      await servicio.registrarPrestamo({ libro_id: 5, usuario_id: 2, fecha_devolucion_esperada: en5 });
      // El libro 5 (El Aleph) tiene 1 copia y ya fue prestada en el seed
      ok('Préstamo registrado');
    } catch (e) { err('Préstamo rechazado correctamente', e); }

    // ── 4. Registrar devolución ───────────────────────────────────
    sep('R4-4 | Registrar devolución');
    if (prestamoId) {
      try {
        const devuelto = await servicio.registrarDevolucion(prestamoId);
        ok(`Devolución registrada. Fecha real: ${devuelto.fecha_devolucion_real}`);
      } catch (e) { err('Error en devolución', e); }
    }

    // ── 5. Préstamos activos ──────────────────────────────────────
    sep('R4-5 | Consultar préstamos activos');
    const activos = await servicio.consultarPrestamosActivos();
    ok(`${activos.length} préstamo(s) activos:`);
    activos.forEach(p => {
      console.log(`   📌 Préstamo #${p.id}: "${p.libro.titulo}" → ${p.usuario.nombre}`);
      console.log(`      Vence: ${p.fecha_devolucion_esperada}`);
    });

    console.log('\n✨ Demo completado exitosamente.\n');
  } catch (error) {
    console.error('Error fatal:', error);
  } finally {
    await sequelize.close();
  }
}

main();
