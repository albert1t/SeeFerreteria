import { getPool } from '../config/db.js';
function mapImportacion(row) {
    return {
        id: row.id,
        brand: row.brand,
        totalRecords: row.totalRecords,
        updated: row.updated,
        errors: row.errors,
        errorDetails: row.errorDetails,
        status: row.status,
        fileName: row.fileName,
        userId: row.userId,
        startedAt: row.startedAt.toISOString(),
        finishedAt: row.finishedAt ? row.finishedAt.toISOString() : null,
    };
}
export async function createImportacion(brand, fileName, userId) {
    const pool = await getPool();
    const [result] = await pool.query(`INSERT INTO CatalogImports (brand, fileName, userId, status, startedAt)
     VALUES (?, ?, ?, 'procesando', UTC_TIMESTAMP(3))`, [brand, fileName, userId]);
    return result.insertId;
}
export async function completeImportacion(id, totalRecords, updated, errors, errorDetails, status) {
    const pool = await getPool();
    await pool.query(`UPDATE CatalogImports
     SET totalRecords = ?, updated = ?, errors = ?, errorDetails = ?, status = ?, finishedAt = UTC_TIMESTAMP(3)
     WHERE id = ?`, [totalRecords, updated, errors, errorDetails, status, id]);
}
export async function findById(id) {
    const pool = await getPool();
    const [rows] = await pool.query(`SELECT id, brand, totalRecords, updated, errors, errorDetails, status, fileName, userId, startedAt, finishedAt
     FROM CatalogImports
     WHERE id = ?`, [id]);
    const row = rows[0];
    return row ? mapImportacion(row) : null;
}
export async function findLastCompleted(brand) {
    const pool = await getPool();
    const [rows] = await pool.query(`SELECT id, brand, totalRecords, updated, errors, errorDetails, status, fileName, userId, startedAt, finishedAt
     FROM CatalogImports
     WHERE brand = ? AND status = 'completado'
     ORDER BY finishedAt DESC
     LIMIT 1`, [brand]);
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
        params.push(item.code, item.pvpOrientativo);
    }
    const [result] = await connection.query(`UPDATE Products
     SET pvpOrientativo = CASE code ${cases} ELSE pvpOrientativo END,
         updatedAt = UTC_TIMESTAMP(6)
     WHERE code IN (${items.map(() => '?').join(', ')})`, [...params, ...items.map((i) => i.code)]);
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
