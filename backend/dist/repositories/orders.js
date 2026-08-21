import { getPool } from '../config/db.js';
function mapPedido(row) {
    return {
        id: row.id,
        productId: row.productId,
        requesterId: row.requesterId,
        type: row.type,
        quantity: row.quantity,
        desiredDeadline: row.desiredDeadline,
        status: row.status,
        priority: Boolean(row.priority),
        notes: row.notes,
        hidden: Boolean(row.hidden),
        requestedAt: row.requestedAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        productRef: row.productRef,
        productName: row.productName,
        productImage: row.productImage,
        productPrice: row.productPrice,
        productPackaging: row.productPackaging,
        requesterName: row.requesterName,
    };
}
const SELECT_BASE = `
  SELECT p.*, r.cmhReference AS productRef, r.name AS productName, r.image AS productImage, r.pvpOrientativo AS productPrice, r.packagingUnit AS productPackaging, u.name AS requesterName
  FROM Orders p
  INNER JOIN Products r ON r.id = p.productId
  INNER JOIN Users u ON u.id = p.requesterId
`;
export async function findAll(filters) {
    const pool = await getPool();
    const conditions = [];
    const params = [];
    if (!filters.incluirOcultos) {
        conditions.push('p.hidden = 0');
    }
    if (!filters.incluirFinalizados) {
        conditions.push("p.status != 'Finalizado'");
    }
    if (filters.type) {
        conditions.push('p.type = ?');
        params.push(filters.type);
    }
    if (filters.fecha) {
        conditions.push('DATE(p.requestedAt) = ?');
        params.push(filters.fecha);
    }
    if (filters.busqueda) {
        conditions.push('(r.name LIKE ? OR r.cmhReference LIKE ? OR u.name LIKE ?)');
        const p = `%${filters.busqueda}%`;
        params.push(p, p, p);
    }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const orderDir = filters.orden === 'antiguo' ? 'ASC' : 'DESC';
    const [rows] = await pool.query(`${SELECT_BASE} ${where} ORDER BY p.priority DESC, p.requestedAt ${orderDir}`, params);
    return rows.map(mapPedido);
}
export async function findById(id) {
    const pool = await getPool();
    const [rows] = await pool.query(`${SELECT_BASE} WHERE p.id = ?`, [id]);
    const row = rows[0];
    return row ? mapPedido(row) : null;
}
export async function findByProductId(productId) {
    const pool = await getPool();
    const [rows] = await pool.query(`${SELECT_BASE} WHERE p.productId = ? ORDER BY p.requestedAt DESC`, [productId]);
    return rows.map(mapPedido);
}
export async function countUrgentes() {
    const pool = await getPool();
    const [rows] = await pool.query("SELECT COUNT(*) AS cnt FROM Orders WHERE priority = 1 AND status != 'Finalizado'");
    return rows[0].cnt;
}
export async function create(data) {
    const pool = await getPool();
    const [result] = await pool.query(`INSERT INTO Orders (productId, requesterId, type, quantity, desiredDeadline, priority, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)`, [data.productId, data.requesterId, data.type, data.quantity, data.desiredDeadline, data.priority, data.notes]);
    const id = result.insertId;
    await pool.query(`INSERT INTO OrderStatusHistory (orderId, userId, previousStatus, newStatus)
    VALUES (?, ?, NULL, ?)`, [id, data.requesterId, 'Solicitado']);
    const order = await findById(id);
    if (!order)
        throw new Error('Failed to create order');
    return order;
}
export async function updateStatus(id, newStatus, userId) {
    const pool = await getPool();
    const existing = await findById(id);
    if (!existing)
        return null;
    await pool.query('UPDATE Orders SET status = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?', [newStatus, id]);
    await pool.query(`INSERT INTO OrderStatusHistory (orderId, userId, previousStatus, newStatus)
    VALUES (?, ?, ?, ?)`, [id, userId, existing.status, newStatus]);
    return findById(id);
}
export async function getHistorial(orderId) {
    const pool = await getPool();
    const [rows] = await pool.query(`SELECT h.*, u.name AS userName
    FROM OrderStatusHistory h
    INNER JOIN Users u ON u.id = h.userId
    WHERE h.orderId = ?
    ORDER BY h.fecha ASC`, [orderId]);
    return rows.map((row) => ({
        id: row.id,
        orderId: row.orderId,
        userId: row.userId,
        previousStatus: row.previousStatus,
        newStatus: row.newStatus,
        fecha: row.fecha.toISOString(),
        userName: row.userName,
    }));
}
export async function updatePedido(id, data) {
    const pool = await getPool();
    const sets = [];
    const params = [];
    if (data.quantity !== undefined) {
        sets.push('quantity = ?');
        params.push(data.quantity);
    }
    if (data.desiredDeadline !== undefined) {
        sets.push('desiredDeadline = ?');
        params.push(data.desiredDeadline);
    }
    if (data.notes !== undefined) {
        sets.push('notes = ?');
        params.push(data.notes);
    }
    if (sets.length === 0)
        return findById(id);
    sets.push('updatedAt = UTC_TIMESTAMP(6)');
    params.push(id);
    await pool.query(`UPDATE Orders SET ${sets.join(', ')} WHERE id = ?`, params);
    return findById(id);
}
export async function deletePedido(id) {
    const pool = await getPool();
    const [result] = await pool.query('DELETE FROM Orders WHERE id = ?', [id]);
    return result.affectedRows > 0;
}
export async function toggleOculto(id) {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT hidden FROM Orders WHERE id = ?', [id]);
    const current = rows[0]?.hidden;
    if (current === undefined)
        return null;
    await pool.query('UPDATE Orders SET hidden = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?', [!current, id]);
    return findById(id);
}
