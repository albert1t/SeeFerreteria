import { getPool } from '../config/db.js';
function mapImportacion(row) {
    return {
        id: row.id,
        marca: row.marca,
        totalRegistros: row.totalRegistros,
        actualizados: row.actualizados,
        errores: row.errores,
        erroresDetalle: row.erroresDetalle,
        estado: row.estado,
        archivoNombre: row.archivoNombre,
        usuarioId: row.usuarioId,
        fechaInicio: row.fechaInicio.toISOString(),
        fechaFin: row.fechaFin ? row.fechaFin.toISOString() : null,
    };
}
export async function createImportacion(marca, archivoNombre, usuarioId) {
    const pool = await getPool();
    const [result] = await pool.query(`INSERT INTO ImportacionesCatalogo (marca, archivoNombre, usuarioId, estado, fechaInicio)
     VALUES (?, ?, ?, 'procesando', UTC_TIMESTAMP(3))`, [marca, archivoNombre, usuarioId]);
    return result.insertId;
}
export async function completeImportacion(id, totalRegistros, actualizados, errores, erroresDetalle, estado) {
    const pool = await getPool();
    await pool.query(`UPDATE ImportacionesCatalogo
     SET totalRegistros = ?, actualizados = ?, errores = ?, erroresDetalle = ?, estado = ?, fechaFin = UTC_TIMESTAMP(3)
     WHERE id = ?`, [totalRegistros, actualizados, errores, erroresDetalle, estado, id]);
}
export async function findById(id) {
    const pool = await getPool();
    const [rows] = await pool.query(`SELECT id, marca, totalRegistros, actualizados, errores, erroresDetalle, estado, archivoNombre, usuarioId, fechaInicio, fechaFin
     FROM ImportacionesCatalogo
     WHERE id = ?`, [id]);
    const row = rows[0];
    return row ? mapImportacion(row) : null;
}
export async function findLastCompleted(marca) {
    const pool = await getPool();
    const [rows] = await pool.query(`SELECT id, marca, totalRegistros, actualizados, errores, erroresDetalle, estado, archivoNombre, usuarioId, fechaInicio, fechaFin
     FROM ImportacionesCatalogo
     WHERE marca = ? AND estado = 'completado'
     ORDER BY fechaFin DESC
     LIMIT 1`, [marca]);
    const row = rows[0];
    return row ? mapImportacion(row) : null;
}
export async function bulkUpdatePreciosChunk(connection, items) {
    if (items.length === 0)
        return 0;
    // Build a single CASE-based bulk UPDATE that touches only the rows present in the chunk.
    // This avoids thousands of individual UPDATE round-trips and keeps the operation atomic.
    const cases = items.map(() => 'WHEN ? THEN ?').join(' ');
    const params = [];
    for (const item of items) {
        params.push(item.codigo, item.pvpOrientativo);
    }
    const [result] = await connection.query(`UPDATE Recambios
     SET pvpOrientativo = CASE codigo ${cases} ELSE pvpOrientativo END,
         updatedAt = UTC_TIMESTAMP(6)
     WHERE codigo IN (${items.map(() => '?').join(', ')})`, [...params, ...items.map((i) => i.codigo)]);
    return result.affectedRows;
}
export async function bulkUpdatePrecios(items) {
    if (items.length === 0)
        return 0;
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const affected = await bulkUpdatePreciosChunk(connection, items);
        await connection.commit();
        return affected;
    }
    catch (err) {
        await connection.rollback();
        throw err;
    }
    finally {
        connection.release();
    }
}
