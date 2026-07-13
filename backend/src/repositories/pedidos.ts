import { getPool } from '../config/db.js';
import type { Pedido, PedidoEstado, PedidoHistorial, PedidoTipo } from '../types/index.js';

function mapPedido(row: Record<string, unknown>): Pedido {
  return {
    id: row.id as number,
    recambioId: row.recambioId as number,
    solicitanteId: row.solicitanteId as number,
    tipo: row.tipo as PedidoTipo,
    cantidad: row.cantidad as number,
    plazoDeseado: row.plazoDeseado as string | null,
    estado: row.estado as PedidoEstado,
    prioritario: row.prioritario as boolean,
    observaciones: row.observaciones as string | null,
    oculto: row.oculto as boolean,
    fechaSolicitud: (row.fechaSolicitud as Date).toISOString(),
    fechaActualizacion: (row.fechaActualizacion as Date).toISOString(),
    recambioRef: row.recambioRef as string | undefined,
    recambioNombre: row.recambioNombre as string | undefined,
    recambioImagen: row.recambioImagen as string | undefined,
    solicitanteNombre: row.solicitanteNombre as string | undefined,
  };
}

const SELECT_BASE = `
  SELECT p.*, r.referenciaCMH AS recambioRef, r.nombre AS recambioNombre, r.imagen AS recambioImagen, u.name AS solicitanteNombre
  FROM Pedidos p
  INNER JOIN Recambios r ON r.id = p.recambioId
  INNER JOIN Users u ON u.id = p.solicitanteId
`;

export async function findAll(filters: {
  busqueda?: string;
  tipo?: PedidoTipo;
  fecha?: string;
  orden?: 'reciente' | 'antiguo';
  incluirFinalizados?: boolean;
  incluirOcultos?: boolean;
}): Promise<Pedido[]> {
  const pool = await getPool();
  const conditions: string[] = [];
  const params: any[] = [];

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
  const [rows] = await pool.query(
    `${SELECT_BASE} ${where} ORDER BY p.prioritario DESC, p.fechaSolicitud ${orderDir}`,
    params
  );
  return (rows as any[]).map(mapPedido);
}

export async function findById(id: number): Promise<Pedido | null> {
  const pool = await getPool();
  const [rows] = await pool.query(`${SELECT_BASE} WHERE p.id = ?`, [id]);
  const row = (rows as any[])[0];
  return row ? mapPedido(row) : null;
}

export async function findByRecambioId(recambioId: number): Promise<Pedido[]> {
  const pool = await getPool();
  const [rows] = await pool.query(`${SELECT_BASE} WHERE p.recambioId = ? ORDER BY p.fechaSolicitud DESC`, [recambioId]);
  return (rows as any[]).map(mapPedido);
}

export async function countUrgentes(): Promise<number> {
  const pool = await getPool();
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS cnt FROM Pedidos WHERE prioritario = 1 AND estado != 'Finalizado'"
  );
  return (rows as any[])[0].cnt as number;
}

export async function create(data: {
  recambioId: number;
  solicitanteId: number;
  tipo: PedidoTipo;
  cantidad: number;
  plazoDeseado: string | null;
  prioritario: boolean;
  observaciones: string | null;
}): Promise<Pedido> {
  const pool = await getPool();
  const [result] = await pool.query(
    `INSERT INTO Pedidos (recambioId, solicitanteId, tipo, cantidad, plazoDeseado, prioritario, observaciones)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.recambioId, data.solicitanteId, data.tipo, data.cantidad, data.plazoDeseado, data.prioritario, data.observaciones]
  );
  const id = (result as any).insertId;

  await pool.query(
    `INSERT INTO PedidosEstadoHistorial (pedidoId, usuarioId, estadoAnterior, estadoNuevo)
    VALUES (?, ?, NULL, ?)`,
    [id, data.solicitanteId, 'Solicitado']
  );

  const pedido = await findById(id);
  if (!pedido) throw new Error('Failed to create pedido');
  return pedido;
}

export async function updateEstado(
  id: number,
  nuevoEstado: PedidoEstado,
  usuarioId: number,
): Promise<Pedido | null> {
  const pool = await getPool();
  const existing = await findById(id);
  if (!existing) return null;

  await pool.query(
    'UPDATE Pedidos SET estado = ?, fechaActualizacion = UTC_TIMESTAMP(6) WHERE id = ?',
    [nuevoEstado, id]
  );

  await pool.query(
    `INSERT INTO PedidosEstadoHistorial (pedidoId, usuarioId, estadoAnterior, estadoNuevo)
    VALUES (?, ?, ?, ?)`,
    [id, usuarioId, existing.estado, nuevoEstado]
  );

  return findById(id);
}

export async function getHistorial(pedidoId: number): Promise<PedidoHistorial[]> {
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT h.*, u.name AS usuarioNombre
    FROM PedidosEstadoHistorial h
    INNER JOIN Users u ON u.id = h.usuarioId
    WHERE h.pedidoId = ?
    ORDER BY h.fecha ASC`,
    [pedidoId]
  );
  return (rows as any[]).map((row: any) => ({
    id: row.id as number,
    pedidoId: row.pedidoId as number,
    usuarioId: row.usuarioId as number,
    estadoAnterior: row.estadoAnterior as string | null,
    estadoNuevo: row.estadoNuevo as string,
    fecha: (row.fecha as Date).toISOString(),
    usuarioNombre: row.usuarioNombre as string,
  }));
}

export async function updatePedido(id: number, data: { cantidad?: number; plazoDeseado?: string | null; observaciones?: string | null }): Promise<Pedido | null> {
  const pool = await getPool();
  const sets: string[] = [];
  const params: any[] = [];
  if (data.cantidad !== undefined) { sets.push('cantidad = ?'); params.push(data.cantidad); }
  if (data.plazoDeseado !== undefined) { sets.push('plazoDeseado = ?'); params.push(data.plazoDeseado); }
  if (data.observaciones !== undefined) { sets.push('observaciones = ?'); params.push(data.observaciones); }
  if (sets.length === 0) return findById(id);
  sets.push('fechaActualizacion = UTC_TIMESTAMP(6)');
  params.push(id);
  await pool.query(`UPDATE Pedidos SET ${sets.join(', ')} WHERE id = ?`, params);
  return findById(id);
}

export async function deletePedido(id: number): Promise<boolean> {
  const pool = await getPool();
  const [result] = await pool.query('DELETE FROM Pedidos WHERE id = ?', [id]);
  return (result as any).affectedRows > 0;
}

export async function toggleOculto(id: number): Promise<Pedido | null> {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT oculto FROM Pedidos WHERE id = ?', [id]);
  const current = (rows as any[])[0]?.oculto;
  if (current === undefined) return null;
  await pool.query('UPDATE Pedidos SET oculto = ?, fechaActualizacion = UTC_TIMESTAMP(6) WHERE id = ?', [!current, id]);
  return findById(id);
}
