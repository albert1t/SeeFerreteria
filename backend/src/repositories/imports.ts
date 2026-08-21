import type { PoolConnection } from 'mysql2/promise';
import { getPool } from '../config/db.js';
import type { CatalogImport } from '../types/index.js';

export type ImportStatus = 'procesando' | 'completado' | 'fallido';

function mapImportacion(row: Record<string, unknown>): CatalogImport {
  return {
    id: row.id as number,
    brand: row.brand as string,
    totalRecords: row.totalRecords as number,
    updated: row.updated as number,
    errors: row.errors as number,
    errorDetails: row.errorDetails as string | null,
    status: row.status as ImportStatus,
    fileName: row.fileName as string | null,
    userId: row.userId as number,
    startedAt: (row.startedAt as Date).toISOString(),
    finishedAt: row.finishedAt ? (row.finishedAt as Date).toISOString() : null,
  };
}

export async function createImportacion(
  brand: string,
  fileName: string | null,
  userId: number,
): Promise<number> {
  const pool = await getPool();
  const [result] = await pool.query(
    `INSERT INTO CatalogImports (brand, fileName, userId, status, startedAt)
     VALUES (?, ?, ?, 'procesando', UTC_TIMESTAMP(3))`,
    [brand, fileName, userId],
  );
  return (result as any).insertId as number;
}

export async function completeImportacion(
  id: number,
  totalRecords: number,
  updated: number,
  errors: number,
  errorDetails: string | null,
  status: ImportStatus,
): Promise<void> {
  const pool = await getPool();
  await pool.query(
    `UPDATE CatalogImports
     SET totalRecords = ?, updated = ?, errors = ?, errorDetails = ?, status = ?, finishedAt = UTC_TIMESTAMP(3)
     WHERE id = ?`,
    [totalRecords, updated, errors, errorDetails, status, id],
  );
}

export async function findById(id: number): Promise<CatalogImport | null> {
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT id, brand, totalRecords, updated, errors, errorDetails, status, fileName, userId, startedAt, finishedAt
     FROM CatalogImports
     WHERE id = ?`,
    [id],
  );
  const row = (rows as any[])[0];
  return row ? mapImportacion(row) : null;
}

export async function findLastCompleted(brand: string): Promise<CatalogImport | null> {
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT id, brand, totalRecords, updated, errors, errorDetails, status, fileName, userId, startedAt, finishedAt
     FROM CatalogImports
     WHERE brand = ? AND status = 'completado'
     ORDER BY finishedAt DESC
     LIMIT 1`,
    [brand],
  );
  const row = (rows as any[])[0];
  return row ? mapImportacion(row) : null;
}

export async function bulkUpdatePreciosChunk(
  connection: PoolConnection,
  items: { code: string; pvpOrientativo: number }[],
): Promise<number> {
  if (items.length === 0) return 0;

  // Build a single CASE-based bulk UPDATE that touches only the rows present in the chunk.
  // This avoids thousands of individual UPDATE round-trips and keeps the operation atomic.
  const cases = items.map(() => 'WHEN ? THEN ?').join(' ');
  const params: any[] = [];
  for (const item of items) {
    params.push(item.code, item.pvpOrientativo);
  }

  const [result] = await connection.query(
    `UPDATE Products
     SET pvpOrientativo = CASE code ${cases} ELSE pvpOrientativo END,
         updatedAt = UTC_TIMESTAMP(6)
     WHERE code IN (${items.map(() => '?').join(', ')})`,
    [...params, ...items.map((i) => i.code)],
  );

  return (result as any).affectedRows as number;
}

export async function bulkUpdatePrecios(
  items: { code: string; pvpOrientativo: number }[],
): Promise<number> {
  if (items.length === 0) return 0;

  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const affected = await bulkUpdatePreciosChunk(connection, items);
    await connection.commit();
    return affected;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
