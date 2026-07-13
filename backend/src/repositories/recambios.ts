import { getPool, query } from '../config/db.js';
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
  const conditions: string[] = [];
  const params: any[] = [];

  if (!filters.incluirOcultos) {
    conditions.push('r.oculto = 0');
  }
  if (filters.panel) {
    conditions.push('r.panel = ?');
    params.push(filters.panel);
  }
  if (filters.busqueda) {
    conditions.push('(r.nombre LIKE ? OR r.referenciaCMH LIKE ? OR r.referenciaCliente LIKE ? OR r.codigo LIKE ?)');
    const p = `%${filters.busqueda}%`;
    params.push(p, p, p, p);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const [rows] = await pool.query(`${SELECT_BASE} ${where} ORDER BY r.panel, r.col, r.row`, params);
  return (rows as any[]).map(mapRecambio);
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
  const [rows] = await pool.query(`${SELECT_PREVIEW} ${where} ORDER BY r.panel, r.col, r.row`);
  return (rows as any[]).map(mapPreview);
}

export async function findById(id: number): Promise<Recambio | null> {
  const pool = await getPool();
  const [rows] = await pool.query(`${SELECT_BASE} WHERE r.id = ?`, [id]);
  const row = (rows as any[])[0];
  return row ? mapRecambio(row) : null;
}

export async function findByReferencia(ref: string): Promise<Recambio | null> {
  const pool = await getPool();
  const [rows] = await pool.query(`${SELECT_BASE} WHERE r.referenciaCMH = ? OR r.referenciaCliente = ?`, [ref, ref]);
  const row = (rows as any[])[0];
  return row ? mapRecambio(row) : null;
}

export async function findExistingReferencias(refs: string[]): Promise<Set<string>> {
  if (refs.length === 0) return new Set();
  const pool = await getPool();
  const placeholders = refs.map(() => '?').join(', ');
  const [rows] = await pool.query(
    `SELECT DISTINCT referenciaCMH FROM Recambios WHERE referenciaCMH IN (${placeholders})`,
    refs
  );
  return new Set((rows as any[]).map((row: any) => row.referenciaCMH as string));
}

export async function findByUbicacion(panel: string, col: number, row: number, excludeId?: number): Promise<Recambio | null> {
  const pool = await getPool();
  let sql = `${SELECT_BASE} WHERE r.panel = ? AND r.col = ? AND r.row = ?`;
  const params: any[] = [panel, col, row];
  if (excludeId) {
    sql += ' AND r.id != ?';
    params.push(excludeId);
  }
  const [rows] = await pool.query(sql, params);
  const r = (rows as any[])[0];
  return r ? mapRecambio(r) : null;
}

export async function create(data: Omit<Recambio, 'id' | 'familiaNombre' | 'createdAt' | 'updatedAt'>): Promise<Recambio> {
  const pool = await getPool();
  const [result] = await pool.query(
    `INSERT INTO Recambios (referenciaCMH, referenciaCliente, codigo, nombre, marca, descripcion,
      metrica, unidadEmbalaje, imagen, plazoEntrega, familiaId, nReposicion, panel, col, row, oculto)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.referenciaCMH, data.referenciaCliente, data.codigo, data.nombre, data.marca,
     data.descripcion, data.metrica, data.unidadEmbalaje, data.imagen, data.plazoEntrega,
     data.familiaId, data.nReposicion, data.panel, data.col, data.row, data.oculto]
  );
  const id = (result as any).insertId;
  const created = await findById(id);
  if (!created) throw new Error('Failed to create recambio');
  return created;
}

export async function update(id: number, data: Partial<Recambio>): Promise<Recambio | null> {
  const pool = await getPool();
  const existing = await findById(id);
  if (!existing) return null;

  await pool.query(
    `UPDATE Recambios SET
      referenciaCMH = ?, referenciaCliente = ?, codigo = ?, nombre = ?,
      marca = ?, descripcion = ?, metrica = ?,
      unidadEmbalaje = ?, imagen = ?, plazoEntrega = ?,
      familiaId = ?, nReposicion = ?,
      panel = ?, col = ?, row = ?, oculto = ?,
      updatedAt = UTC_TIMESTAMP(6)
    WHERE id = ?`,
    [data.referenciaCMH ?? existing.referenciaCMH, data.referenciaCliente ?? existing.referenciaCliente,
     data.codigo ?? existing.codigo, data.nombre ?? existing.nombre,
     data.marca ?? existing.marca, data.descripcion ?? existing.descripcion,
     data.metrica ?? existing.metrica, data.unidadEmbalaje ?? existing.unidadEmbalaje,
     data.imagen ?? existing.imagen, data.plazoEntrega ?? existing.plazoEntrega,
     data.familiaId ?? existing.familiaId, data.nReposicion ?? existing.nReposicion,
     data.panel ?? existing.panel, data.col ?? existing.col,
     data.row ?? existing.row, data.oculto ?? existing.oculto, id]
  );

  return findById(id);
}

export async function setOculto(id: number, oculto: boolean): Promise<Recambio | null> {
  const pool = await getPool();
  await pool.query('UPDATE Recambios SET oculto = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?', [oculto, id]);
  return findById(id);
}

export async function remove(id: number): Promise<boolean> {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT COUNT(*) AS cnt FROM Pedidos WHERE recambioId = ?', [id]);
  if ((rows as any[])[0].cnt > 0) return false;
  const [result] = await pool.query('DELETE FROM Recambios WHERE id = ?', [id]);
  return (result as any).affectedRows > 0;
}

export async function getPanelResumen(): Promise<{ panel: string; totalRecambios: number }[]> {
  const pool = await getPool();
  const [rows] = await pool.query(`
    SELECT p.panel, COALESCE(COUNT(r.id), 0) AS totalRecambios
    FROM (
      SELECT CONCAT('A', n) AS panel
      FROM (
        SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
        UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
        UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
        UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
        UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25
      ) nums
    ) p
    LEFT JOIN Recambios r ON r.panel = p.panel AND r.oculto = 0
    GROUP BY p.panel
    ORDER BY p.panel
  `);
  return (rows as any[]).map((r: any) => ({
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

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    await connection.query(
      "UPDATE Recambios SET panel = 'ZZ', col = 1, `row` = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?",
      [id1 % 15 + 1, id1]
    );
    await connection.query(
      'UPDATE Recambios SET panel = ?, col = ?, `row` = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?',
      [r1.panel, r1.col, r1.row, id2]
    );
    await connection.query(
      'UPDATE Recambios SET panel = ?, col = ?, `row` = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?',
      [r2.panel, r2.col, r2.row, id1]
    );
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function getPanelOccupancy(panel: string): Promise<{ col: number; row: number; recambioId: number | null }[]> {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT col, `row`, id AS recambioId FROM Recambios WHERE panel = ?',
    [panel]
  );
  return (rows as any[]).map((r: any) => ({
    col: r.col as number,
    row: r.row as number,
    recambioId: r.recambioId as number,
  }));
}
