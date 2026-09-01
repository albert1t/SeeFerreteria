import { getPool } from '../config/db.js';
function mapRecambio(row) {
    return {
        id: row.id,
        cmhReference: row.cmhReference,
        customerReference: row.customerReference,
        code: row.code,
        name: row.name,
        brand: row.brand,
        description: row.description,
        metric: row.metric,
        packagingUnit: row.packagingUnit,
        pvpOrientativo: row.pvpOrientativo,
        pvpOrientativoMoneda: row.pvpOrientativoMoneda,
        image: row.image,
        deliveryTime: row.deliveryTime,
        familyId: row.familyId,
        familyName: row.familyName,
        reorderPoint: row.reorderPoint,
        panel: row.panel,
        col: row.col,
        row: row.row,
        hidden: Boolean(row.hidden),
        createdAt: row.createdAt ? row.createdAt.toISOString() : undefined,
        updatedAt: row.updatedAt ? row.updatedAt.toISOString() : undefined,
    };
}
const SELECT_BASE = `
  SELECT r.*, f.name AS familyName
  FROM Products r
  INNER JOIN Families f ON f.id = r.familyId
`;
export async function findAll(filters) {
    const pool = await getPool();
    const conditions = [];
    const params = [];
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
    return rows.map(mapRecambio);
}
const SELECT_PREVIEW = `
  SELECT r.id, r.panel, r.col, r.row, r.image, r.cmhReference, f.name AS familyName
  FROM Products r
  INNER JOIN Families f ON f.id = r.familyId
`;
function mapPreview(row) {
    return {
        id: row.id,
        panel: row.panel,
        col: row.col,
        row: row.row,
        image: row.image,
        cmhReference: row.cmhReference,
        familyName: row.familyName,
    };
}
export async function findPreview(incluirOcultos = false) {
    const pool = await getPool();
    const where = incluirOcultos ? '' : 'WHERE r.hidden = 0';
    const [rows] = await pool.query(`${SELECT_PREVIEW} ${where} ORDER BY r.panel, r.col, r.row`);
    return rows.map(mapPreview);
}
export async function findById(id) {
    const pool = await getPool();
    const [rows] = await pool.query(`${SELECT_BASE} WHERE r.id = ?`, [id]);
    const row = rows[0];
    return row ? mapRecambio(row) : null;
}
export async function findByReferencia(ref) {
    const pool = await getPool();
    const [rows] = await pool.query(`${SELECT_BASE} WHERE r.cmhReference = ? OR r.customerReference = ?`, [ref, ref]);
    const row = rows[0];
    return row ? mapRecambio(row) : null;
}
export async function findExistingReferencias(refs) {
    if (refs.length === 0)
        return new Set();
    const pool = await getPool();
    const placeholders = refs.map(() => '?').join(', ');
    const [rows] = await pool.query(`SELECT DISTINCT cmhReference FROM Products WHERE cmhReference IN (${placeholders})`, refs);
    return new Set(rows.map((row) => row.cmhReference));
}
export async function findByUbicacion(panel, col, row, excludeId) {
    const pool = await getPool();
    let sql = `${SELECT_BASE} WHERE r.panel = ? AND r.col = ? AND r.row = ?`;
    const params = [panel, col, row];
    if (excludeId) {
        sql += ' AND r.id != ?';
        params.push(excludeId);
    }
    const [rows] = await pool.query(sql, params);
    const r = rows[0];
    return r ? mapRecambio(r) : null;
}
export async function create(data) {
    const pool = await getPool();
    const [result] = await pool.query(`INSERT INTO Products (cmhReference, customerReference, code, name, brand, description,
      metric, packagingUnit, image, deliveryTime, familyId, reorderPoint, panel, col, row, hidden)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [data.cmhReference, data.customerReference, data.code, data.name, data.brand,
        data.description, data.metric, data.packagingUnit, data.image, data.deliveryTime,
        data.familyId, data.reorderPoint, data.panel, data.col, data.row, data.hidden]);
    const id = result.insertId;
    const created = await findById(id);
    if (!created)
        throw new Error('Failed to create product');
    return created;
}
export async function update(id, data) {
    const pool = await getPool();
    const existing = await findById(id);
    if (!existing)
        return null;
    await pool.query(`UPDATE Products SET
      cmhReference = ?, customerReference = ?, code = ?, name = ?,
      brand = ?, description = ?, metric = ?,
      packagingUnit = ?, image = ?, deliveryTime = ?,
      familyId = ?, reorderPoint = ?,
      panel = ?, col = ?, row = ?, hidden = ?,
      updatedAt = UTC_TIMESTAMP(6)
    WHERE id = ?`, [data.cmhReference ?? existing.cmhReference, data.customerReference ?? existing.customerReference,
        data.code ?? existing.code, data.name ?? existing.name,
        data.brand ?? existing.brand, data.description ?? existing.description,
        data.metric ?? existing.metric, data.packagingUnit ?? existing.packagingUnit,
        data.image ?? existing.image, data.deliveryTime ?? existing.deliveryTime,
        data.familyId ?? existing.familyId, data.reorderPoint ?? existing.reorderPoint,
        data.panel ?? existing.panel, data.col ?? existing.col,
        data.row ?? existing.row, data.hidden ?? existing.hidden, id]);
    return findById(id);
}
export async function setOculto(id, hidden) {
    const pool = await getPool();
    await pool.query('UPDATE Products SET hidden = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?', [hidden, id]);
    return findById(id);
}
export async function remove(id) {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT COUNT(*) AS cnt FROM Orders WHERE productId = ?', [id]);
    if (rows[0].cnt > 0)
        return false;
    const [result] = await pool.query('DELETE FROM Products WHERE id = ?', [id]);
    return result.affectedRows > 0;
}
export async function getPanelSummary() {
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
    return rows.map((r) => ({
        panel: r.panel,
        totalProducts: r.totalProducts,
    }));
}
export async function getCubetasByPanel(panel, incluirOcultos = false) {
    return findAll({ panel, incluirOcultos });
}
export async function swapPositions(id1, id2) {
    const pool = await getPool();
    const r1 = await findById(id1);
    const r2 = await findById(id2);
    if (!r1 || !r2)
        throw new Error('Product no encontrado');
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
        await connection.query("UPDATE Products SET panel = 'ZZ', col = 1, `row` = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?", [id1 % 15 + 1, id1]);
        await connection.query('UPDATE Products SET panel = ?, col = ?, `row` = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?', [r1.panel, r1.col, r1.row, id2]);
        await connection.query('UPDATE Products SET panel = ?, col = ?, `row` = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?', [r2.panel, r2.col, r2.row, id1]);
        await connection.commit();
    }
    catch (err) {
        await connection.rollback();
        throw err;
    }
    finally {
        connection.release();
    }
}
export async function getPanelOccupancy(panel) {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT col, `row`, id AS productId FROM Products WHERE panel = ?', [panel]);
    return rows.map((r) => ({
        col: r.col,
        row: r.row,
        productId: r.productId,
    }));
}
export async function assignPosition(id, panel, col, row) {
    const pool = await getPool();
    await pool.query('UPDATE Products SET panel = ?, col = ?, `row` = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?', [panel, col, row, id]);
    return findById(id);
}
export async function findUnpositioned() {
    const pool = await getPool();
    const [rows] = await pool.query(`${SELECT_BASE} WHERE r.panel IS NULL ORDER BY r.cmhReference`);
    return rows.map(mapRecambio);
}
