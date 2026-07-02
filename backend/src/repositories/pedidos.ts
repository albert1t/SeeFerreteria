import { getPool, sql } from '../config/db.js';
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
}): Promise<Pedido[]> {
  const pool = await getPool();
  const request = pool.request();
  let where = 'WHERE 1=1';

  if (!filters.incluirFinalizados) {
    where += " AND p.estado != 'Finalizado'";
  }
  if (filters.tipo) {
    where += ' AND p.tipo = @tipo';
    request.input('tipo', sql.NVarChar(30), filters.tipo);
  }
  if (filters.fecha) {
    where += ' AND CAST(p.fechaSolicitud AS DATE) = @fecha';
    request.input('fecha', sql.Date, filters.fecha);
  }
  if (filters.busqueda) {
    where += ' AND (r.nombre LIKE @busqueda OR r.referenciaCMH LIKE @busqueda OR u.name LIKE @busqueda)';
    request.input('busqueda', sql.NVarChar(200), `%${filters.busqueda}%`);
  }

  const orderDir = filters.orden === 'antiguo' ? 'ASC' : 'DESC';
  const result = await request.query(`
    ${SELECT_BASE} ${where}
    ORDER BY p.prioritario DESC, p.fechaSolicitud ${orderDir}
  `);
  return result.recordset.map(mapPedido);
}

export async function findById(id: number): Promise<Pedido | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`${SELECT_BASE} WHERE p.id = @id`);
  const row = result.recordset[0];
  return row ? mapPedido(row) : null;
}

export async function findByRecambioId(recambioId: number): Promise<Pedido[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('recambioId', sql.Int, recambioId)
    .query(`${SELECT_BASE} WHERE p.recambioId = @recambioId ORDER BY p.fechaSolicitud DESC`);
  return result.recordset.map(mapPedido);
}

export async function countUrgentes(): Promise<number> {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT COUNT(*) AS cnt FROM Pedidos
    WHERE prioritario = 1 AND estado != 'Finalizado'
  `);
  return result.recordset[0].cnt as number;
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
  const result = await pool.request()
    .input('recambioId', sql.Int, data.recambioId)
    .input('solicitanteId', sql.Int, data.solicitanteId)
    .input('tipo', sql.NVarChar(30), data.tipo)
    .input('cantidad', sql.Int, data.cantidad)
    .input('plazoDeseado', sql.NVarChar(50), data.plazoDeseado)
    .input('prioritario', sql.Bit, data.prioritario)
    .input('observaciones', sql.NVarChar(sql.MAX), data.observaciones)
    .query(`
      INSERT INTO Pedidos (recambioId, solicitanteId, tipo, cantidad, plazoDeseado, prioritario, observaciones)
      OUTPUT INSERTED.id
      VALUES (@recambioId, @solicitanteId, @tipo, @cantidad, @plazoDeseado, @prioritario, @observaciones)
    `);

  const id = result.recordset[0].id as number;

  await pool.request()
    .input('pedidoId', sql.Int, id)
    .input('usuarioId', sql.Int, data.solicitanteId)
    .input('estadoNuevo', sql.NVarChar(30), 'Solicitado')
    .query(`
      INSERT INTO PedidosEstadoHistorial (pedidoId, usuarioId, estadoAnterior, estadoNuevo)
      VALUES (@pedidoId, @usuarioId, NULL, @estadoNuevo)
    `);

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

  await pool.request()
    .input('id', sql.Int, id)
    .input('estado', sql.NVarChar(30), nuevoEstado)
    .query(`
      UPDATE Pedidos SET estado = @estado, fechaActualizacion = SYSUTCDATETIME() WHERE id = @id
    `);

  await pool.request()
    .input('pedidoId', sql.Int, id)
    .input('usuarioId', sql.Int, usuarioId)
    .input('estadoAnterior', sql.NVarChar(30), existing.estado)
    .input('estadoNuevo', sql.NVarChar(30), nuevoEstado)
    .query(`
      INSERT INTO PedidosEstadoHistorial (pedidoId, usuarioId, estadoAnterior, estadoNuevo)
      VALUES (@pedidoId, @usuarioId, @estadoAnterior, @estadoNuevo)
    `);

  return findById(id);
}

export async function getHistorial(pedidoId: number): Promise<PedidoHistorial[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('pedidoId', sql.Int, pedidoId)
    .query(`
      SELECT h.*, u.name AS usuarioNombre
      FROM PedidosEstadoHistorial h
      INNER JOIN Users u ON u.id = h.usuarioId
      WHERE h.pedidoId = @pedidoId
      ORDER BY h.fecha ASC
    `);
  return result.recordset.map((row) => ({
    id: row.id as number,
    pedidoId: row.pedidoId as number,
    usuarioId: row.usuarioId as number,
    estadoAnterior: row.estadoAnterior as string | null,
    estadoNuevo: row.estadoNuevo as string,
    fecha: (row.fecha as Date).toISOString(),
    usuarioNombre: row.usuarioNombre as string,
  }));
}
