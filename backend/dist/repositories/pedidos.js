import { getPool } from '../config/db.js';
function mapPedido(row) {
    return {
        id: row.id,
        recambioId: row.recambioId,
        solicitanteId: row.solicitanteId,
        tipo: row.tipo,
        cantidad: row.cantidad,
        plazoDeseado: row.plazoDeseado,
        estado: row.estado,
        prioritario: row.prioritario,
        observaciones: row.observaciones,
        oculto: row.oculto,
        fechaSolicitud: row.fechaSolicitud.toISOString(),
        fechaActualizacion: row.fechaActualizacion.toISOString(),
        recambioRef: row.recambioRef,
        recambioNombre: row.recambioNombre,
        recambioImagen: row.recambioImagen,
        solicitanteNombre: row.solicitanteNombre,
    };
}
const SELECT_BASE = `
  SELECT p.*, r.referenciaCMH AS recambioRef, r.nombre AS recambioNombre, r.imagen AS recambioImagen, u.name AS solicitanteNombre
  FROM Pedidos p
  INNER JOIN Recambios r ON r.id = p.recambioId
  INNER JOIN Users u ON u.id = p.solicitanteId
`;
export async function findAll(filters) {
    const pool = await getPool();
    const conditions = [];
    const params = [];
    if (!filters.incluirOcultos) {
        conditions.push('p.oculto = 0');
    }
    if (!filters.incluirFinalizados) {
        conditions.push("p.estado != 'Finalizado'");
    }
    if (filters.tipo) {
        conditions.push('p.tipo = ?');
        params.push(filters.tipo);
    }
    if (filters.fecha) {
        conditions.push('DATE(p.fechaSolicitud) = ?');
        params.push(filters.fecha);
    }
    if (filters.busqueda) {
        conditions.push('(r.nombre LIKE ? OR r.referenciaCMH LIKE ? OR u.name LIKE ?)');
        const p = `%${filters.busqueda}%`;
        params.push(p, p, p);
    }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const orderDir = filters.orden === 'antiguo' ? 'ASC' : 'DESC';
    const [rows] = await pool.query(`${SELECT_BASE} ${where} ORDER BY p.prioritario DESC, p.fechaSolicitud ${orderDir}`, params);
    return rows.map(mapPedido);
}
export async function findById(id) {
    const pool = await getPool();
    const [rows] = await pool.query(`${SELECT_BASE} WHERE p.id = ?`, [id]);
    const row = rows[0];
    return row ? mapPedido(row) : null;
}
export async function findByRecambioId(recambioId) {
    const pool = await getPool();
    const [rows] = await pool.query(`${SELECT_BASE} WHERE p.recambioId = ? ORDER BY p.fechaSolicitud DESC`, [recambioId]);
    return rows.map(mapPedido);
}
export async function countUrgentes() {
    const pool = await getPool();
    const [rows] = await pool.query("SELECT COUNT(*) AS cnt FROM Pedidos WHERE prioritario = 1 AND estado != 'Finalizado'");
    return rows[0].cnt;
}
export async function create(data) {
    const pool = await getPool();
    const [result] = await pool.query(`INSERT INTO Pedidos (recambioId, solicitanteId, tipo, cantidad, plazoDeseado, prioritario, observaciones)
    VALUES (?, ?, ?, ?, ?, ?, ?)`, [data.recambioId, data.solicitanteId, data.tipo, data.cantidad, data.plazoDeseado, data.prioritario, data.observaciones]);
    const id = result.insertId;
    await pool.query(`INSERT INTO PedidosEstadoHistorial (pedidoId, usuarioId, estadoAnterior, estadoNuevo)
    VALUES (?, ?, NULL, ?)`, [id, data.solicitanteId, 'Solicitado']);
    const pedido = await findById(id);
    if (!pedido)
        throw new Error('Failed to create pedido');
    return pedido;
}
export async function updateEstado(id, nuevoEstado, usuarioId) {
    const pool = await getPool();
    const existing = await findById(id);
    if (!existing)
        return null;
    await pool.query('UPDATE Pedidos SET estado = ?, fechaActualizacion = UTC_TIMESTAMP(6) WHERE id = ?', [nuevoEstado, id]);
    await pool.query(`INSERT INTO PedidosEstadoHistorial (pedidoId, usuarioId, estadoAnterior, estadoNuevo)
    VALUES (?, ?, ?, ?)`, [id, usuarioId, existing.estado, nuevoEstado]);
    return findById(id);
}
export async function getHistorial(pedidoId) {
    const pool = await getPool();
    const [rows] = await pool.query(`SELECT h.*, u.name AS usuarioNombre
    FROM PedidosEstadoHistorial h
    INNER JOIN Users u ON u.id = h.usuarioId
    WHERE h.pedidoId = ?
    ORDER BY h.fecha ASC`, [pedidoId]);
    return rows.map((row) => ({
        id: row.id,
        pedidoId: row.pedidoId,
        usuarioId: row.usuarioId,
        estadoAnterior: row.estadoAnterior,
        estadoNuevo: row.estadoNuevo,
        fecha: row.fecha.toISOString(),
        usuarioNombre: row.usuarioNombre,
    }));
}
export async function updatePedido(id, data) {
    const pool = await getPool();
    const sets = [];
    const params = [];
    if (data.cantidad !== undefined) {
        sets.push('cantidad = ?');
        params.push(data.cantidad);
    }
    if (data.plazoDeseado !== undefined) {
        sets.push('plazoDeseado = ?');
        params.push(data.plazoDeseado);
    }
    if (data.observaciones !== undefined) {
        sets.push('observaciones = ?');
        params.push(data.observaciones);
    }
    if (sets.length === 0)
        return findById(id);
    sets.push('fechaActualizacion = UTC_TIMESTAMP(6)');
    params.push(id);
    await pool.query(`UPDATE Pedidos SET ${sets.join(', ')} WHERE id = ?`, params);
    return findById(id);
}
export async function deletePedido(id) {
    const pool = await getPool();
    const [result] = await pool.query('DELETE FROM Pedidos WHERE id = ?', [id]);
    return result.affectedRows > 0;
}
export async function toggleOculto(id) {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT oculto FROM Pedidos WHERE id = ?', [id]);
    const current = rows[0]?.oculto;
    if (current === undefined)
        return null;
    await pool.query('UPDATE Pedidos SET oculto = ?, fechaActualizacion = UTC_TIMESTAMP(6) WHERE id = ?', [!current, id]);
    return findById(id);
}
