import { getPool } from '../config/db.js';
import type { Order, OrderStatus, OrderHistory, OrderType } from '../types/index.js';

function mapPedido(row: Record<string, unknown>): Order {
  return {
    id: row.id as number,
    productId: row.productId as number,
    requesterId: row.requesterId as number,
    type: row.type as OrderType,
    quantity: row.quantity as number,
    desiredDeadline: row.desiredDeadline as string | null,
    status: row.status as OrderStatus,
    priority: Boolean(row.priority),
    notes: row.notes as string | null,
    hidden: Boolean(row.hidden),
    requestedAt: (row.requestedAt as Date).toISOString(),
    updatedAt: (row.updatedAt as Date).toISOString(),
    productRef: row.productRef as string | undefined,
    productName: row.productName as string | undefined,
    productImage: row.productImage as string | undefined,
    productPrice: row.productPrice as number | undefined,
    productPackaging: row.productPackaging as string | undefined,
    requesterName: row.requesterName as string | undefined,
  };
}

const SELECT_BASE = `
  SELECT p.*, r.cmhReference AS productRef, r.name AS productName, r.image AS productImage, r.pvpOrientativo AS productPrice, r.packagingUnit AS productPackaging, u.name AS requesterName
  FROM Orders p
  INNER JOIN Products r ON r.id = p.productId
  INNER JOIN Users u ON u.id = p.requesterId
`;

export async function findAll(filters: {
  busqueda?: string;
  type?: OrderType;
  fecha?: string;
  orden?: 'reciente' | 'antiguo';
  incluirFinalizados?: boolean;
  incluirOcultos?: boolean;
}): Promise<Order[]> {
  const pool = await getPool();
  const conditions: string[] = [];
  const params: any[] = [];

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
  const [rows] = await pool.query(
    `${SELECT_BASE} ${where} ORDER BY p.priority DESC, p.requestedAt ${orderDir}`,
    params
  );
  return (rows as any[]).map(mapPedido);
}

export async function findById(id: number): Promise<Order | null> {
  const pool = await getPool();
  const [rows] = await pool.query(`${SELECT_BASE} WHERE p.id = ?`, [id]);
  const row = (rows as any[])[0];
  return row ? mapPedido(row) : null;
}

export async function findByProductId(productId: number): Promise<Order[]> {
  const pool = await getPool();
  const [rows] = await pool.query(`${SELECT_BASE} WHERE p.productId = ? ORDER BY p.requestedAt DESC`, [productId]);
  return (rows as any[]).map(mapPedido);
}

export async function countUrgentes(): Promise<number> {
  const pool = await getPool();
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS cnt FROM Orders WHERE priority = 1 AND status != 'Finalizado'"
  );
  return (rows as any[])[0].cnt as number;
}

export async function create(data: {
  productId: number;
  requesterId: number;
  type: OrderType;
  quantity: number;
  desiredDeadline: string | null;
  priority: boolean;
  notes: string | null;
}): Promise<Order> {
  const pool = await getPool();
  const [result] = await pool.query(
    `INSERT INTO Orders (productId, requesterId, type, quantity, desiredDeadline, priority, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.productId, data.requesterId, data.type, data.quantity, data.desiredDeadline, data.priority, data.notes]
  );
  const id = (result as any).insertId;

  await pool.query(
    `INSERT INTO OrderStatusHistory (orderId, userId, previousStatus, newStatus)
    VALUES (?, ?, NULL, ?)`,
    [id, data.requesterId, 'Solicitado']
  );

  const order = await findById(id);
  if (!order) throw new Error('Failed to create order');
  return order;
}

export async function updateStatus(
  id: number,
  newStatus: OrderStatus,
  userId: number,
): Promise<Order | null> {
  const pool = await getPool();
  const existing = await findById(id);
  if (!existing) return null;

  await pool.query(
    'UPDATE Orders SET status = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?',
    [newStatus, id]
  );

  await pool.query(
    `INSERT INTO OrderStatusHistory (orderId, userId, previousStatus, newStatus)
    VALUES (?, ?, ?, ?)`,
    [id, userId, existing.status, newStatus]
  );

  return findById(id);
}

export async function getHistorial(orderId: number): Promise<OrderHistory[]> {
  const pool = await getPool();
  const [rows] =   await pool.query(
    `SELECT h.*, u.name AS userName
    FROM OrderStatusHistory h
    INNER JOIN Users u ON u.id = h.userId
    WHERE h.orderId = ?
    ORDER BY h.createdAt ASC`,
    [orderId]
  );
  return (rows as any[]).map((row: any) => ({
    id: row.id as number,
    orderId: row.orderId as number,
    userId: row.userId as number,
    previousStatus: row.previousStatus as string | null,
    newStatus: row.newStatus as string,
    createdAt: (row.createdAt as Date).toISOString(),
    userName: row.userName as string,
  }));
}

export async function updatePedido(id: number, data: { quantity?: number; desiredDeadline?: string | null; notes?: string | null }): Promise<Order | null> {
  const pool = await getPool();
  const sets: string[] = [];
  const params: any[] = [];
  if (data.quantity !== undefined) { sets.push('quantity = ?'); params.push(data.quantity); }
  if (data.desiredDeadline !== undefined) { sets.push('desiredDeadline = ?'); params.push(data.desiredDeadline); }
  if (data.notes !== undefined) { sets.push('notes = ?'); params.push(data.notes); }
  if (sets.length === 0) return findById(id);
  sets.push('updatedAt = UTC_TIMESTAMP(6)');
  params.push(id);
  await pool.query(`UPDATE Orders SET ${sets.join(', ')} WHERE id = ?`, params);
  return findById(id);
}

export async function deletePedido(id: number): Promise<boolean> {
  const pool = await getPool();
  const [result] = await pool.query('DELETE FROM Orders WHERE id = ?', [id]);
  return (result as any).affectedRows > 0;
}

export async function toggleOculto(id: number): Promise<Order | null> {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT hidden FROM Orders WHERE id = ?', [id]);
  const current = (rows as any[])[0]?.hidden;
  if (current === undefined) return null;
  await pool.query('UPDATE Orders SET hidden = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?', [!current, id]);
  return findById(id);
}
