import { getPool, sql } from '../config/db.js';
import type { Recambio, RecambioPreview } from '../types/index.js';

function mapRecambio(row: Record<string, unknown>): Recambio {
  return {
    id: row.id as number,
    referenciaCMH: row.referenciaCMH as string,
    referenciaCliente: row.referenciaCliente as string | null,
    codigo: row.codigo as string | null,
    nombre: row.nombre as string,
    marca: row.marca as string | null,
    descripcion: row.descripcion as string | null,
    metrica: row.metrica as string | null,
    unidadEmbalaje: row.unidadEmbalaje as string | null,
    imagen: row.imagen as string | null,
    plazoEntrega: row.plazoEntrega as string | null,
    familiaId: row.familiaId as number,
    familiaNombre: row.familiaNombre as string | undefined,
    nReposicion: row.nReposicion as number | null,
    panel: row.panel as string,
    col: row.col as number,
    row: row.row as number,
    oculto: row.oculto as boolean,
    createdAt: row.createdAt ? (row.createdAt as Date).toISOString() : undefined,
    updatedAt: row.updatedAt ? (row.updatedAt as Date).toISOString() : undefined,
  };
}

const SELECT_BASE = `
  SELECT r.*, f.nombre AS familiaNombre
  FROM Recambios r
  INNER JOIN Familias f ON f.id = r.familiaId
`;

export async function findAll(filters: {
  panel?: string;
  busqueda?: string;
  incluirOcultos?: boolean;
}): Promise<Recambio[]> {
  const pool = await getPool();
  const request = pool.request();
  let where = 'WHERE 1=1';

  if (!filters.incluirOcultos) {
    where += ' AND r.oculto = 0';
  }
  if (filters.panel) {
    where += ' AND r.panel = @panel';
    request.input('panel', sql.NVarChar(10), filters.panel);
  }
  if (filters.busqueda) {
    where += ' AND (r.nombre LIKE @busqueda OR r.referenciaCMH LIKE @busqueda OR r.referenciaCliente LIKE @busqueda OR r.codigo LIKE @busqueda)';
    request.input('busqueda', sql.NVarChar(200), `%${filters.busqueda}%`);
  }

  const result = await request.query(`${SELECT_BASE} ${where} ORDER BY r.panel, r.col, r.row`);
  return result.recordset.map(mapRecambio);
}

const SELECT_PREVIEW = `
  SELECT r.id, r.panel, r.col, r.row, r.imagen, r.referenciaCMH, f.nombre AS familiaNombre
  FROM Recambios r
  INNER JOIN Familias f ON f.id = r.familiaId
`;

function mapPreview(row: Record<string, unknown>): RecambioPreview {
  return {
    id: row.id as number,
    panel: row.panel as string,
    col: row.col as number,
    row: row.row as number,
    imagen: row.imagen as string | null,
    referenciaCMH: row.referenciaCMH as string,
    familiaNombre: row.familiaNombre as string | undefined,
  };
}

export async function findPreview(incluirOcultos = false): Promise<RecambioPreview[]> {
  const pool = await getPool();
  const where = incluirOcultos ? '' : 'WHERE r.oculto = 0';
  const result = await pool.query(`${SELECT_PREVIEW} ${where} ORDER BY r.panel, r.col, r.row`);
  return result.recordset.map(mapPreview);
}

export async function findById(id: number): Promise<Recambio | null> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query(`${SELECT_BASE} WHERE r.id = @id`);
  const row = result.recordset[0];
  return row ? mapRecambio(row) : null;
}

export async function findByReferencia(ref: string): Promise<Recambio | null> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('ref', sql.NVarChar(50), ref)
    .query(`${SELECT_BASE} WHERE r.referenciaCMH = @ref OR r.referenciaCliente = @ref`);
  const row = result.recordset[0];
  return row ? mapRecambio(row) : null;
}

export async function findExistingReferencias(refs: string[]): Promise<Set<string>> {
  if (refs.length === 0) return new Set();
  const pool = await getPool();
  const vals = refs.map((_, i) => `@ref${i}`).join(', ');
  const request = pool.request();
  refs.forEach((r, i) => request.input(`ref${i}`, sql.NVarChar(50), r));
  const result = await request.query(`
    SELECT DISTINCT referenciaCMH FROM Recambios
    WHERE referenciaCMH IN (${vals})
  `);
  return new Set(result.recordset.map((row: any) => row.referenciaCMH as string));
}

export async function findByUbicacion(panel: string, col: number, row: number, excludeId?: number): Promise<Recambio | null> {
  const pool = await getPool();
  const request = pool.request()
    .input('panel', sql.NVarChar(10), panel)
    .input('col', sql.TinyInt, col)
    .input('row', sql.TinyInt, row);

  let query = `${SELECT_BASE} WHERE r.panel = @panel AND r.col = @col AND r.row = @row`;
  if (excludeId) {
    query += ' AND r.id != @excludeId';
    request.input('excludeId', sql.Int, excludeId);
  }

  const result = await request.query(query);
  const r = result.recordset[0];
  return r ? mapRecambio(r) : null;
}

export async function create(data: Omit<Recambio, 'id' | 'familiaNombre' | 'createdAt' | 'updatedAt'>): Promise<Recambio> {
  const pool = await getPool();
  const result = await pool.request()
    .input('referenciaCMH', sql.NVarChar(50), data.referenciaCMH)
    .input('referenciaCliente', sql.NVarChar(50), data.referenciaCliente)
    .input('codigo', sql.NVarChar(50), data.codigo)
    .input('nombre', sql.NVarChar(200), data.nombre)
    .input('marca', sql.NVarChar(100), data.marca)
    .input('descripcion', sql.NVarChar(sql.MAX), data.descripcion)
    .input('metrica', sql.NVarChar(100), data.metrica)
    .input('unidadEmbalaje', sql.NVarChar(100), data.unidadEmbalaje)
    .input('imagen', sql.NVarChar(500), data.imagen)
    .input('plazoEntrega', sql.NVarChar(50), data.plazoEntrega)
    .input('familiaId', sql.Int, data.familiaId)
    .input('nReposicion', sql.Int, data.nReposicion)
    .input('panel', sql.NVarChar(10), data.panel)
    .input('col', sql.TinyInt, data.col)
    .input('row', sql.TinyInt, data.row)
    .input('oculto', sql.Bit, data.oculto)
    .query(`
      INSERT INTO Recambios (referenciaCMH, referenciaCliente, codigo, nombre, marca, descripcion,
        metrica, unidadEmbalaje, imagen, plazoEntrega, familiaId, nReposicion, panel, col, row, oculto)
      OUTPUT INSERTED.id
      VALUES (@referenciaCMH, @referenciaCliente, @codigo, @nombre, @marca, @descripcion,
        @metrica, @unidadEmbalaje, @imagen, @plazoEntrega, @familiaId, @nReposicion, @panel, @col, @row, @oculto)
    `);

  const id = result.recordset[0].id as number;
  const created = await findById(id);
  if (!created) throw new Error('Failed to create recambio');
  return created;
}

export async function update(id: number, data: Partial<Recambio>): Promise<Recambio | null> {
  const pool = await getPool();
  const existing = await findById(id);
  if (!existing) return null;

  await pool.request()
    .input('id', sql.Int, id)
    .input('referenciaCMH', sql.NVarChar(50), data.referenciaCMH ?? existing.referenciaCMH)
    .input('referenciaCliente', sql.NVarChar(50), data.referenciaCliente ?? existing.referenciaCliente)
    .input('codigo', sql.NVarChar(50), data.codigo ?? existing.codigo)
    .input('nombre', sql.NVarChar(200), data.nombre ?? existing.nombre)
    .input('marca', sql.NVarChar(100), data.marca ?? existing.marca)
    .input('descripcion', sql.NVarChar(sql.MAX), data.descripcion ?? existing.descripcion)
    .input('unidadEmbalaje', sql.NVarChar(100), data.unidadEmbalaje ?? existing.unidadEmbalaje)
    .input('imagen', sql.NVarChar(500), data.imagen ?? existing.imagen)
    .input('plazoEntrega', sql.NVarChar(50), data.plazoEntrega ?? existing.plazoEntrega)
    .input('familiaId', sql.Int, data.familiaId ?? existing.familiaId)
    .input('nReposicion', sql.Int, data.nReposicion ?? existing.nReposicion)
    .input('panel', sql.NVarChar(10), data.panel ?? existing.panel)
    .input('col', sql.TinyInt, data.col ?? existing.col)
    .input('row', sql.TinyInt, data.row ?? existing.row)
    .input('metrica', sql.NVarChar(100), data.metrica ?? existing.metrica)
    .input('oculto', sql.Bit, data.oculto ?? existing.oculto)
    .query(`
      UPDATE Recambios SET
        referenciaCMH = @referenciaCMH, referenciaCliente = @referenciaCliente, codigo = @codigo, nombre = @nombre,
        marca = @marca, descripcion = @descripcion, metrica = @metrica,
        unidadEmbalaje = @unidadEmbalaje, imagen = @imagen, plazoEntrega = @plazoEntrega,
        familiaId = @familiaId, nReposicion = @nReposicion,
        panel = @panel, col = @col, row = @row, oculto = @oculto,
        updatedAt = SYSUTCDATETIME()
      WHERE id = @id
    `);

  return findById(id);
}

export async function setOculto(id: number, oculto: boolean): Promise<Recambio | null> {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, id)
    .input('oculto', sql.Bit, oculto)
    .query('UPDATE Recambios SET oculto = @oculto, updatedAt = SYSUTCDATETIME() WHERE id = @id');
  return findById(id);
}

export async function remove(id: number): Promise<boolean> {
  const pool = await getPool();

  // La FK FK_Pedidos_Recambio impide borrar si existe cualquier pedido,
  // sea cual sea su estado. Comprobamos todos antes de intentar el DELETE.
  const anyPedidos = await pool.request()
    .input('id', sql.Int, id)
    .query(`SELECT COUNT(*) AS cnt FROM Pedidos WHERE recambioId = @id`);

  if ((anyPedidos.recordset[0].cnt as number) > 0) {
    return false;
  }

  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('DELETE FROM Recambios WHERE id = @id');
  return (result.rowsAffected[0] ?? 0) > 0;
}

export async function getPanelResumen(): Promise<{ panel: string; totalRecambios: number }[]> {
  const pool = await getPool();
  const result = await pool.request().query(`
    WITH Paneles AS (
      SELECT CONCAT('A', n) AS panel
      FROM (SELECT TOP 25 ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n FROM sys.objects) x
    )
    SELECT p.panel, ISNULL(COUNT(r.id), 0) AS totalRecambios
    FROM Paneles p
    LEFT JOIN Recambios r ON r.panel = p.panel AND r.oculto = 0
    GROUP BY p.panel
    ORDER BY p.panel
  `);
  return result.recordset.map((r) => ({
    panel: r.panel as string,
    totalRecambios: r.totalRecambios as number,
  }));
}

export async function getCubetasByPanel(panel: string, incluirOcultos = false): Promise<Recambio[]> {
  return findAll({ panel, incluirOcultos });
}

export async function swapPositions(id1: number, id2: number): Promise<void> {
  const pool = await getPool();

  const r1 = await findById(id1);
  const r2 = await findById(id2);
  if (!r1 || !r2) throw new Error('Recambio no encontrado');

  // Usamos una transacción para evitar violación de la constraint UNIQUE (panel, col, row)
  // La posición temporal usa col=99 que está fuera del rango normal (1-6/5)
  // SQL Server no tiene CHECK en col/row que lo impida en esta BD
  const transaction = pool.transaction();
  await transaction.begin();

  try {
    // 1. Mover r1 a una posición temporal única
    await transaction.request()
      .input('id1', sql.Int, id1)
      .input('tmpRow', sql.TinyInt, id1 % 15 + 1)
      .query(`UPDATE Recambios SET panel = 'ZZ', col = 1, [row] = @tmpRow, updatedAt = SYSUTCDATETIME() WHERE id = @id1`);

    // 2. Mover r2 a la posición original de r1
    await transaction.request()
      .input('id2', sql.Int, id2)
      .input('p1', sql.NVarChar(10), r1.panel)
      .input('c1', sql.TinyInt, r1.col)
      .input('r1b', sql.TinyInt, r1.row)
      .query(`UPDATE Recambios SET panel = @p1, col = @c1, [row] = @r1b, updatedAt = SYSUTCDATETIME() WHERE id = @id2`);

    // 3. Mover r1 (en temporal) a la posición original de r2
    await transaction.request()
      .input('id1', sql.Int, id1)
      .input('p2', sql.NVarChar(10), r2.panel)
      .input('c2', sql.TinyInt, r2.col)
      .input('r2b', sql.TinyInt, r2.row)
      .query(`UPDATE Recambios SET panel = @p2, col = @c2, [row] = @r2b, updatedAt = SYSUTCDATETIME() WHERE id = @id1`);

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

export async function getPanelOccupancy(panel: string): Promise<{ col: number; row: number; recambioId: number | null }[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('panel', sql.NVarChar(10), panel)
    .query(`
      SELECT col, [row], id AS recambioId FROM Recambios WHERE panel = @panel
    `);
  return result.recordset.map((r) => ({
    col: r.col as number,
    row: r.row as number,
    recambioId: r.recambioId as number,
  }));
}
