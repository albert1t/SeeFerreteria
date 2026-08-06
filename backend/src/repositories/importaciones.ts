import type { PoolConnection } from 'mysql2/promise';
import { getPool } from '../config/db.js';
import type { ImportacionCatalogo } from '../types/index.js';

export type ImportacionEstado = 'procesando' | 'completado' | 'fallido';

function mapImportacion(row: Record<string, unknown>): ImportacionCatalogo {
  return {
    id: row.id as number,
    marca: row.marca as string,
    totalRegistros: row.totalRegistros as number,
    actualizados: row.actualizados as number,
    errores: row.errores as number,
    erroresDetalle: row.erroresDetalle as string | null,
    estado: row.estado as ImportacionEstado,
    archivoNombre: row.archivoNombre as string | null,
    usuarioId: row.usuarioId as number,
    fechaInicio: (row.fechaInicio as Date).toISOString(),
    fechaFin: row.fechaFin ? (row.fechaFin as Date).toISOString() : null,
  };
}

export async function createImportacion(
  marca: string,
  archivoNombre: string | null,
  usuarioId: number,
): Promise<number> {
  const pool = await getPool();
  const [result] = await pool.query(
    `INSERT INTO ImportacionesCatalogo (marca, archivoNombre, usuarioId, estado, fechaInicio)
     VALUES (?, ?, ?, 'procesando', UTC_TIMESTAMP(3))`,
    [marca, archivoNombre, usuarioId],
  );
  return (result as any).insertId as number;
}

export async function completeImportacion(
  id: number,
  totalRegistros: number,
  actualizados: number,
  errores: number,
  erroresDetalle: string | null,
  estado: ImportacionEstado,
): Promise<void> {
  const pool = await getPool();
  await pool.query(
    `UPDATE ImportacionesCatalogo
     SET totalRegistros = ?, actualizados = ?, errores = ?, erroresDetalle = ?, estado = ?, fechaFin = UTC_TIMESTAMP(3)
     WHERE id = ?`,
    [totalRegistros, actualizados, errores, erroresDetalle, estado, id],
  );
}

export async function findById(id: number): Promise<ImportacionCatalogo | null> {
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT id, marca, totalRegistros, actualizados, errores, erroresDetalle, estado, archivoNombre, usuarioId, fechaInicio, fechaFin
     FROM ImportacionesCatalogo
     WHERE id = ?`,
    [id],
  );
  const row = (rows as any[])[0];
  return row ? mapImportacion(row) : null;
}

export async function findLastCompleted(marca: string): Promise<ImportacionCatalogo | null> {
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT id, marca, totalRegistros, actualizados, errores, erroresDetalle, estado, archivoNombre, usuarioId, fechaInicio, fechaFin
     FROM ImportacionesCatalogo
     WHERE marca = ? AND estado = 'completado'
     ORDER BY fechaFin DESC
     LIMIT 1`,
    [marca],
  );
  const row = (rows as any[])[0];
  return row ? mapImportacion(row) : null;
}

export async function bulkUpdatePreciosChunk(
  connection: PoolConnection,
  items: { codigo: string; pvpOrientativo: number }[],
): Promise<number> {
  if (items.length === 0) return 0;

  // Build a single CASE-based bulk UPDATE that touches only the rows present in the chunk.
  // This avoids thousands of individual UPDATE round-trips and keeps the operation atomic.
  const cases = items.map(() => 'WHEN ? THEN ?').join(' ');
  const params: any[] = [];
  for (const item of items) {
    params.push(item.codigo, item.pvpOrientativo);
  }

  const [result] = await connection.query(
    `UPDATE Recambios
     SET pvpOrientativo = CASE codigo ${cases} ELSE pvpOrientativo END,
         updatedAt = UTC_TIMESTAMP(6)
     WHERE codigo IN (${items.map(() => '?').join(', ')})`,
    [...params, ...items.map((i) => i.codigo)],
  );

  return (result as any).affectedRows as number;
}

export async function bulkUpdatePrecios(
  items: { codigo: string; pvpOrientativo: number }[],
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
