import { getPool, query } from '../config/db.js';
import type { Product, ProductPreview } from '../types/index.js';

function mapRecambio(row: Record<string, unknown>): Product {
  return {
    id: row.id as number,
    cmhReference: row.cmhReference as string,
    customerReference: row.customerReference as string | null,
    code: row.code as string | null,
    name: row.name as string,
    brand: row.brand as string | null,
    description: row.description as string | null,
    metric: row.metric as string | null,
    packagingUnit: row.packagingUnit as string | null,
    pvpOrientativo: row.pvpOrientativo as number | null,
    pvpOrientativoMoneda: row.pvpOrientativoMoneda as string | null,
    image: row.image as string | null,
    deliveryTime: row.deliveryTime as string | null,
    familyId: row.familyId as number,
    familyName: row.familyName as string | undefined,
    reorderPoint: row.reorderPoint as number | null,
    panel: row.panel as string,
    col: row.col as number,
    row: row.row as number,
    hidden: Boolean(row.hidden),
    createdAt: row.createdAt ? (row.createdAt as Date).toISOString() : undefined,
    updatedAt: row.updatedAt ? (row.updatedAt as Date).toISOString() : undefined,
  };
}

const SELECT_BASE = `
  SELECT r.*, f.name AS familyName
  FROM Products r
  INNER JOIN Families f ON f.id = r.familyId
`;

export async function findAll(filters: {
  panel?: string;
  busqueda?: string;
  incluirOcultos?: boolean;
}): Promise<Product[]> {
  const pool = await getPool();
  const conditions: string[] = [];
  const params: any[] = [];

  if (!filters.incluirOcultos) {
    conditions.push('r.hidden = 0');
  }
  if (filters.panel) {
    conditions.push('r.panel = ?');
    params.push(filters.panel);
  }
  if (filters.busqueda) {
    conditions.push('(r.name LIKE ? OR r.cmhReference LIKE ? OR r.customerReference LIKE ? OR r.code LIKE ?)');
    const p = `%${filters.busqueda}%`;
    params.push(p, p, p, p);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const [rows] = await pool.query(`${SELECT_BASE} ${where} ORDER BY r.panel, r.col, r.row`, params);
  return (rows as any[]).map(mapRecambio);
}

const SELECT_PREVIEW = `
  SELECT r.id, r.panel, r.col, r.row, r.image, r.cmhReference, f.name AS familyName
  FROM Products r
  INNER JOIN Families f ON f.id = r.familyId
`;

function mapPreview(row: Record<string, unknown>): ProductPreview {
  return {
    id: row.id as number,
    panel: row.panel as string,
    col: row.col as number,
    row: row.row as number,
    image: row.image as string | null,
    cmhReference: row.cmhReference as string,
    familyName: row.familyName as string | undefined,
  };
}

export async function findPreview(incluirOcultos = false): Promise<ProductPreview[]> {
  const pool = await getPool();
  const where = incluirOcultos ? '' : 'WHERE r.hidden = 0';
  const [rows] = await pool.query(`${SELECT_PREVIEW} ${where} ORDER BY r.panel, r.col, r.row`);
  return (rows as any[]).map(mapPreview);
}

export async function findById(id: number): Promise<Product | null> {
  const pool = await getPool();
  const [rows] = await pool.query(`${SELECT_BASE} WHERE r.id = ?`, [id]);
  const row = (rows as any[])[0];
  return row ? mapRecambio(row) : null;
}

export async function findByReferencia(ref: string): Promise<Product | null> {
  const pool = await getPool();
  const [rows] = await pool.query(`${SELECT_BASE} WHERE r.cmhReference = ? OR r.customerReference = ?`, [ref, ref]);
  const row = (rows as any[])[0];
  return row ? mapRecambio(row) : null;
}

export async function findExistingReferencias(refs: string[]): Promise<Set<string>> {
  if (refs.length === 0) return new Set();
  const pool = await getPool();
  const placeholders = refs.map(() => '?').join(', ');
  const [rows] = await pool.query(
    `SELECT DISTINCT cmhReference FROM Products WHERE cmhReference IN (${placeholders})`,
    refs
  );
  return new Set((rows as any[]).map((row: any) => row.cmhReference as string));
}

export async function findByUbicacion(panel: string, col: number, row: number, excludeId?: number): Promise<Product | null> {
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

export async function create(data: Omit<Product, 'id' | 'familyName' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const pool = await getPool();
  const [result] = await pool.query(
    `INSERT INTO Products (cmhReference, customerReference, code, name, brand, description,
      metric, packagingUnit, image, deliveryTime, familyId, reorderPoint, panel, col, row, hidden)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.cmhReference, data.customerReference, data.code, data.name, data.brand,
     data.description, data.metric, data.packagingUnit, data.image, data.deliveryTime,
     data.familyId, data.reorderPoint, data.panel, data.col, data.row, data.hidden]
  );
  const id = (result as any).insertId;
  const created = await findById(id);
  if (!created) throw new Error('Failed to create product');
  return created;
}

export async function update(id: number, data: Partial<Product>): Promise<Product | null> {
  const pool = await getPool();
  const existing = await findById(id);
  if (!existing) return null;

  await pool.query(
    `UPDATE Products SET
      cmhReference = ?, customerReference = ?, code = ?, name = ?,
      brand = ?, description = ?, metric = ?,
      packagingUnit = ?, image = ?, deliveryTime = ?,
      familyId = ?, reorderPoint = ?,
      panel = ?, col = ?, row = ?, hidden = ?,
      updatedAt = UTC_TIMESTAMP(6)
    WHERE id = ?`,
    [data.cmhReference ?? existing.cmhReference, data.customerReference ?? existing.customerReference,
     data.code ?? existing.code, data.name ?? existing.name,
     data.brand ?? existing.brand, data.description ?? existing.description,
     data.metric ?? existing.metric, data.packagingUnit ?? existing.packagingUnit,
     data.image ?? existing.image, data.deliveryTime ?? existing.deliveryTime,
     data.familyId ?? existing.familyId, data.reorderPoint ?? existing.reorderPoint,
     data.panel ?? existing.panel, data.col ?? existing.col,
     data.row ?? existing.row, data.hidden ?? existing.hidden, id]
  );

  return findById(id);
}

export async function setOculto(id: number, hidden: boolean): Promise<Product | null> {
  const pool = await getPool();
  await pool.query('UPDATE Products SET hidden = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?', [hidden, id]);
  return findById(id);
}

export async function remove(id: number): Promise<boolean> {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT COUNT(*) AS cnt FROM Orders WHERE productId = ?', [id]);
  if ((rows as any[])[0].cnt > 0) return false;
  const [result] = await pool.query('DELETE FROM Products WHERE id = ?', [id]);
  return (result as any).affectedRows > 0;
}

export async function getPanelSummary(): Promise<{ panel: string; totalProducts: number }[]> {
  const pool = await getPool();
  const [rows] = await pool.query(`
    SELECT p.panel, COALESCE(COUNT(r.id), 0) AS totalProducts
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
    LEFT JOIN Products r ON r.panel = p.panel AND r.hidden = 0
    GROUP BY p.panel
    ORDER BY p.panel
  `);
  return (rows as any[]).map((r: any) => ({
    panel: r.panel as string,
    totalProducts: r.totalProducts as number,
  }));
}

export async function getCubetasByPanel(panel: string, incluirOcultos = false): Promise<Product[]> {
  return findAll({ panel, incluirOcultos });
}

export async function swapPositions(id1: number, id2: number): Promise<void> {
  const pool = await getPool();
  const r1 = await findById(id1);
  const r2 = await findById(id2);
  if (!r1 || !r2) throw new Error('Product no encontrado');

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    await connection.query(
      "UPDATE Products SET panel = 'ZZ', col = 1, `row` = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?",
      [id1 % 15 + 1, id1]
    );
    await connection.query(
      'UPDATE Products SET panel = ?, col = ?, `row` = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?',
      [r1.panel, r1.col, r1.row, id2]
    );
    await connection.query(
      'UPDATE Products SET panel = ?, col = ?, `row` = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?',
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

export async function getPanelOccupancy(panel: string): Promise<{ col: number; row: number; productId: number | null }[]> {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT col, `row`, id AS productId FROM Products WHERE panel = ?',
    [panel]
  );
  return (rows as any[]).map((r: any) => ({
    col: r.col as number,
    row: r.row as number,
    productId: r.productId as number,
  }));
}
