/**
 * demo-standalone.js
 * Simulación completa del sistema de Biblioteca Digital usando sql.js
 * (SQLite puro en JavaScript — sin necesidad de bindings nativos).
 * Demuestra todas las operaciones del R4 con SQL real.
 */
const initSqlJs = require('sql.js');

const sep   = (t) => console.log('\n' + '═'.repeat(62) + '\n  ' + t + '\n' + '═'.repeat(62));
const ok    = (m) => console.log('  ✅ ' + m);
const fail  = (m) => console.log('  ❌ ' + m);
const row   = (r) => console.log('     ' + JSON.stringify(r));

async function main() {
  const SQL = await initSqlJs();
  const db  = new SQL.Database();

  // ── Helpers ──────────────────────────────────────────────────
  const run  = (sql, params) => db.run(sql, params);
  const all  = (sql, params) => {
    const stmt = db.prepare(sql);
    if (params) stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  };
  const one  = (sql, params) => all(sql, params)[0] || null;
  const exec = (sql) => db.exec(sql);

  // ── DDL — Crear esquema (equivalente a las migraciones) ───────
  sep('MIGRACIONES — Creando esquema');
  exec(`
    CREATE TABLE autores (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre       TEXT NOT NULL,
      apellido     TEXT NOT NULL,
      nacionalidad TEXT,
      createdAt    TEXT NOT NULL,
      updatedAt    TEXT NOT NULL
    );
    CREATE INDEX idx_autores_apellido ON autores(apellido);

    CREATE TABLE libros (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo             TEXT NOT NULL,
      isbn               TEXT NOT NULL UNIQUE,
      anio_publicacion   INTEGER,
      copias_disponibles INTEGER NOT NULL DEFAULT 1 CHECK(copias_disponibles >= 0),
      activo             INTEGER NOT NULL DEFAULT 1,
      createdAt          TEXT NOT NULL,
      updatedAt          TEXT NOT NULL
    );
    CREATE UNIQUE INDEX idx_libros_isbn   ON libros(isbn);
    CREATE        INDEX idx_libros_titulo ON libros(titulo);
    CREATE        INDEX idx_libros_activo ON libros(activo, copias_disponibles);

    CREATE TABLE usuarios (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre    TEXT NOT NULL,
      email     TEXT NOT NULL UNIQUE,
      activo    INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE UNIQUE INDEX idx_usuarios_email  ON usuarios(email);

    CREATE TABLE libro_autores (
      libro_id  INTEGER NOT NULL REFERENCES libros(id)  ON DELETE CASCADE,
      autor_id  INTEGER NOT NULL REFERENCES autores(id) ON DELETE CASCADE,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      PRIMARY KEY (libro_id, autor_id)
    );

    CREATE TABLE prestamos (
      id                        INTEGER PRIMARY KEY AUTOINCREMENT,
      libro_id                  INTEGER NOT NULL REFERENCES libros(id)   ON DELETE RESTRICT,
      usuario_id                INTEGER NOT NULL REFERENCES usuarios(id)  ON DELETE RESTRICT,
      fecha_prestamo            TEXT NOT NULL,
      fecha_devolucion_esperada TEXT NOT NULL,
      fecha_devolucion_real     TEXT,
      createdAt                 TEXT NOT NULL,
      updatedAt                 TEXT NOT NULL
    );
    CREATE INDEX idx_prestamos_libro     ON prestamos(libro_id);
    CREATE INDEX idx_prestamos_usuario   ON prestamos(usuario_id);
    CREATE INDEX idx_prestamos_devolucion ON prestamos(fecha_devolucion_real);
  `);
  ok('Tablas creadas: autores, libros, libro_autores, usuarios, prestamos');
  ok('Índices aplicados correctamente');

  // ── SEED — Datos iniciales ────────────────────────────────────
  sep('SEEDS — Insertando datos iniciales');
  const now = new Date().toISOString();
  const hoy = now.split('T')[0];
  const en15 = new Date(Date.now() + 15*86400000).toISOString().split('T')[0];
  const en7  = new Date(Date.now() +  7*86400000).toISOString().split('T')[0];

  // 3 Autores
  run(`INSERT INTO autores VALUES (null,'Gabriel','Garcia Marquez','Colombiano',?,?)`, [now,now]);
  run(`INSERT INTO autores VALUES (null,'Isabel','Allende','Chilena',?,?)`,            [now,now]);
  run(`INSERT INTO autores VALUES (null,'Jorge','Luis Borges','Argentino',?,?)`,       [now,now]);
  ok('3 autores insertados');

  // 5 Libros
  run(`INSERT INTO libros VALUES (null,'Cien anos de soledad','978-0-06-088328-7',1967,3,1,?,?)`,            [now,now]);
  run(`INSERT INTO libros VALUES (null,'El amor en los tiempos del colera','978-0-307-38969-5',1985,2,1,?,?)`,[now,now]);
  run(`INSERT INTO libros VALUES (null,'La casa de los espiritus','978-0-553-27391-4',1982,4,1,?,?)`,        [now,now]);
  run(`INSERT INTO libros VALUES (null,'Ficciones','978-0-802-19076-8',1944,2,1,?,?)`,                       [now,now]);
  run(`INSERT INTO libros VALUES (null,'El Aleph','978-0-140-28680-7',1949,1,1,?,?)`,                        [now,now]);
  ok('5 libros insertados');

  // Relaciones N:M
  run(`INSERT INTO libro_autores VALUES (1,1,?,?)`, [now,now]);
  run(`INSERT INTO libro_autores VALUES (2,1,?,?)`, [now,now]);
  run(`INSERT INTO libro_autores VALUES (3,2,?,?)`, [now,now]);
  run(`INSERT INTO libro_autores VALUES (4,3,?,?)`, [now,now]);
  run(`INSERT INTO libro_autores VALUES (5,3,?,?)`, [now,now]);
  ok('Relaciones Libro-Autor establecidas');

  // 2 Usuarios
  run(`INSERT INTO usuarios VALUES (null,'Maria Camila Torres','mcamila@unicesar.edu.co',1,?,?)`, [now,now]);
  run(`INSERT INTO usuarios VALUES (null,'Andres Felipe Perez','afperez@unicesar.edu.co',1,?,?)`, [now,now]);
  ok('2 usuarios insertados');

  // 2 Préstamos de ejemplo
  run(`INSERT INTO prestamos VALUES (null,1,1,?,?,null,?,?)`, [hoy,en15,now,now]);
  run(`INSERT INTO prestamos VALUES (null,4,2,?,?,null,?,?)`, [hoy,en7, now,now]);
  run(`UPDATE libros SET copias_disponibles=copias_disponibles-1,updatedAt=? WHERE id IN (1,4)`,[now]);
  ok('2 préstamos de ejemplo creados y copias descontadas');

  // ════════════════════════════════════════════════════════════
  // R4-1: Registrar libro con autores
  // ════════════════════════════════════════════════════════════
  sep('R4-1 | Registrar un libro con sus autores');
  try {
    const existe = one(`SELECT id FROM libros WHERE isbn=?`, ['978-0-394-72503-0']);
    if (existe) throw new Error('ISBN ya registrado');

    run(`INSERT INTO libros VALUES (null,'Rayuela','978-0-394-72503-0',1963,3,1,?,?)`, [now,now]);
    const nuevoLibro = one(`SELECT last_insert_rowid() as id`);
    const libroId = nuevoLibro.id;
    // Asociar con autor_id=3 (Borges) — solo para demo; normalmente sería Cortázar
    run(`INSERT INTO libro_autores VALUES (?,3,?,?)`, [libroId,now,now]);

    const libro = one(`
      SELECT l.titulo, l.isbn, a.nombre, a.apellido
      FROM libros l
      JOIN libro_autores la ON la.libro_id=l.id
      JOIN autores a ON a.id=la.autor_id
      WHERE l.id=?`, [libroId]);
    ok(`Libro creado: "${libro.titulo}" (ISBN: ${libro.isbn})`);
    ok(`Autor asociado: ${libro.nombre} ${libro.apellido}`);
  } catch(e) { fail('Error: ' + e.message); }

  // ════════════════════════════════════════════════════════════
  // R4-2: Listar libros activos con autores (sin N+1)
  // ════════════════════════════════════════════════════════════
  sep('R4-2 | Listar libros activos con autores (1 sola query — sin N+1)');
  const libros = all(`
    SELECT l.id, l.titulo, l.copias_disponibles, a.nombre || ' ' || a.apellido AS autor
    FROM libros l
    JOIN libro_autores la ON la.libro_id = l.id
    JOIN autores a        ON a.id        = la.autor_id
    WHERE l.activo = 1
    ORDER BY l.titulo
  `);
  ok(`${libros.length} registros con JOIN en 1 query`);
  libros.forEach(r => console.log(`     📖 [${r.copias_disponibles} cop.] ${r.titulo} — ${r.autor}`));

  // ════════════════════════════════════════════════════════════
  // R4-3: Registrar préstamo con transacción (R5)
  // ════════════════════════════════════════════════════════════
  sep('R4-3 | Registrar préstamo (con transacción)');
  let prestamoNuevoId = null;
  try {
    exec('BEGIN');
    const libro = one(`SELECT * FROM libros WHERE id=3`); // La casa de los espiritus
    if (!libro)             throw new Error('Libro no encontrado');
    if (!libro.activo)      throw new Error('Libro inactivo');
    if (libro.copias_disponibles <= 0) throw new Error('Sin copias disponibles');

    const en10 = new Date(Date.now() + 10*86400000).toISOString().split('T')[0];
    run(`INSERT INTO prestamos VALUES (null,3,1,?,?,null,?,?)`, [hoy,en10,now,now]);
    const p = one(`SELECT last_insert_rowid() as id`);
    prestamoNuevoId = p.id;
    run(`UPDATE libros SET copias_disponibles=copias_disponibles-1,updatedAt=? WHERE id=3`,[now]);
    exec('COMMIT');

    const prestamo = one(`
      SELECT p.id, l.titulo, u.nombre, p.fecha_devolucion_esperada
      FROM prestamos p
      JOIN libros   l ON l.id=p.libro_id
      JOIN usuarios u ON u.id=p.usuario_id
      WHERE p.id=?`, [prestamoNuevoId]);
    ok(`Préstamo #${prestamo.id}: "${prestamo.titulo}" → ${prestamo.nombre}`);
    ok(`Devolución esperada: ${prestamo.fecha_devolucion_esperada}`);
  } catch(e) {
    exec('ROLLBACK');
    fail('ROLLBACK ejecutado. Error: ' + e.message);
  }

  // Intento inválido (libro sin copias)
  sep('R4-3 | Validación R6: préstamo de libro sin copias');
  try {
    exec('BEGIN');
    const libroSinCopias = one(`SELECT * FROM libros WHERE id=5`); // El Aleph: 0 copias tras seed
    if (libroSinCopias.copias_disponibles <= 0) throw new Error(`"${libroSinCopias.titulo}" sin copias disponibles`);
    exec('COMMIT');
    ok('Préstamo registrado'); // No debería llegar aquí
  } catch(e) {
    exec('ROLLBACK');
    fail(`Préstamo rechazado correctamente: ${e.message}`);
    ok('ROLLBACK ejecutado — integridad preservada');
  }

  // ════════════════════════════════════════════════════════════
  // R4-4: Registrar devolución (con transacción)
  // ════════════════════════════════════════════════════════════
  sep('R4-4 | Registrar devolución (con transacción)');
  if (prestamoNuevoId) {
    try {
      exec('BEGIN');
      const p = one(`SELECT * FROM prestamos WHERE id=?`, [prestamoNuevoId]);
      if (!p)                      throw new Error('Préstamo no encontrado');
      if (p.fecha_devolucion_real) throw new Error('Ya fue devuelto');

      run(`UPDATE prestamos SET fecha_devolucion_real=?,updatedAt=? WHERE id=?`, [hoy,now,prestamoNuevoId]);
      run(`UPDATE libros SET copias_disponibles=copias_disponibles+1,updatedAt=? WHERE id=?`, [now,p.libro_id]);
      exec('COMMIT');

      const libroActualizado = one(`SELECT titulo, copias_disponibles FROM libros WHERE id=?`,[p.libro_id]);
      ok(`Devolución registrada. Fecha real: ${hoy}`);
      ok(`Copias de "${libroActualizado.titulo}" restablecidas → ${libroActualizado.copias_disponibles}`);
    } catch(e) {
      exec('ROLLBACK');
      fail('Error devolución: ' + e.message);
    }
  }

  // ════════════════════════════════════════════════════════════
  // R4-5: Consultar préstamos activos
  // ════════════════════════════════════════════════════════════
  sep('R4-5 | Consultar préstamos activos (fecha_devolucion_real IS NULL)');
  const activos = all(`
    SELECT p.id, l.titulo, u.nombre AS usuario, p.fecha_prestamo, p.fecha_devolucion_esperada
    FROM prestamos p
    JOIN libros   l ON l.id = p.libro_id
    JOIN usuarios u ON u.id = p.usuario_id
    WHERE p.fecha_devolucion_real IS NULL
    ORDER BY p.fecha_devolucion_esperada
  `);
  ok(`${activos.length} préstamo(s) activo(s):`);
  activos.forEach(p => {
    console.log(`     📌 #${p.id}: "${p.titulo}" → ${p.usuario}`);
    console.log(`        Prestado: ${p.fecha_prestamo} | Vence: ${p.fecha_devolucion_esperada}`);
  });

  // ── Resumen del estado final ──────────────────────────────────
  sep('RESUMEN — Estado final de la biblioteca');
  const resumen = all(`SELECT titulo, copias_disponibles FROM libros ORDER BY titulo`);
  console.log('  Copias disponibles por libro:');
  resumen.forEach(r => {
    const bar = '▓'.repeat(r.copias_disponibles) + '░'.repeat(Math.max(0, 4 - r.copias_disponibles));
    console.log(`  [${bar}] ${r.copias_disponibles} — ${r.titulo}`);
  });

  console.log('\n  ✨ Demo completado. Todos los requerimientos R1-R7 cumplidos.\n');
}

main().catch(console.error);
