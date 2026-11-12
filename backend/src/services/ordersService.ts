import * as ordersRepo from '../repositories/orders.js';
import * as productsRepo from '../repositories/products.js';
import * as usersRepo from '../repositories/users.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  enviarAcuseSolicitante,
  enviarActualizacionPedido,
  enviarSeguimientoEstado,
  notificarEventoPedido,
  resolveNotificationEmail,
} from './mailService.js';
import {
  shouldNotifyOrderEvent,
  type Order,
  type OrderStatus,
  type OrderHistory,
  type OrderType,
  type OrderNotificationEvent,
  type UserRole,
} from '../types/index.js';

const ESTADO_ORDEN: OrderStatus[] = ['Solicitado', 'Pedido realizado', 'Pedido recibido', 'Finalizado'];

async function resolveRequesterEmail(requesterId: number): Promise<string | null> {
  const requester = await usersRepo.findById(requesterId);
  if (!requester) return null;
  const notificationEmail = await usersRepo.getNotificationEmail(requesterId);
  return resolveNotificationEmail(requester.username, notificationEmail);
}

export async function listOrders(filters: {
  busqueda?: string;
  type?: OrderType;
  familyId?: number;
  fecha?: string;
  orden?: 'reciente' | 'antiguo';
  incluirFinalizados?: boolean;
  incluirOcultos?: boolean;
}): Promise<Order[]> {
  return ordersRepo.findAll(filters);
}

export async function getPedido(id: number): Promise<Order & { historial: OrderHistory[] }> {
  const order = await ordersRepo.findById(id);
  if (!order) throw new AppError(404, 'Order no encontrado');
  const historial = await ordersRepo.getHistorial(id);
  return { ...order, historial };
}

export async function getOrdersByProduct(productId: number): Promise<Order[]> {
  return ordersRepo.findByProductId(productId);
}

export async function countUrgentes(): Promise<number> {
  return ordersRepo.countUrgentes();
}

export async function createOrder(
  data: {
    productId: number;
    type: OrderType;
    quantity?: number;
    desiredDeadline?: string | null;
    notes?: string | null;
  },
  requesterId: number,
): Promise<Order> {
  const product = await productsRepo.findById(data.productId);
  if (!product) throw new AppError(404, 'Product no encontrado');

  let quantity: number;
  let desiredDeadline: string | null;
  let priority = false;

  switch (data.type) {
    case 'Reposición':
      quantity = product.reorderPoint ?? 1;
      desiredDeadline = product.deliveryTime;
      break;
    case 'Solicitud':
      if (!data.quantity || !data.desiredDeadline) {
        throw new AppError(400, 'Solicitud requiere quantity y plazo deseado');
      }
      quantity = data.quantity;
      desiredDeadline = data.desiredDeadline;
      break;
    case 'Solicitud Express':
      quantity = data.quantity ?? product.reorderPoint ?? 1;
      desiredDeadline = data.desiredDeadline ?? product.deliveryTime;
      priority = true;
      break;
    default:
      throw new AppError(400, 'Tipo de order inválido');
  }

  const order = await ordersRepo.create({
    productId: data.productId,
    requesterId,
    type: data.type,
    quantity,
    desiredDeadline,
    priority,
    notes: data.notes ?? null,
  });

  // Notificaciones asíncronas: nunca deben afectar la respuesta de la API
  (async () => {
    try {
      const prefs = await usersRepo.getOrderNotificationPrefs(requesterId);
      if (shouldNotifyOrderEvent(prefs, order.type, 'created')) {
        const destino = await resolveRequesterEmail(requesterId);
        if (destino) await enviarAcuseSolicitante(order, destino);
      }
      await notificarEventoPedido(order, 'created');
    } catch (err) {
      console.error('[ordersService] Error en notificaciones de createOrder:', err);
    }
  })();

  return order;
}

export async function advanceStatus(id: number, newStatus: OrderStatus, userId: number, role: UserRole): Promise<Order> {
  if (newStatus === 'Pedido recibido' && role !== 'admin' && role !== 'almacen') {
    throw new AppError(403, 'Solo Almacén o un administrador pueden marcar un pedido como recibido');
  }
  const order = await ordersRepo.findById(id);
  if (!order) throw new AppError(404, 'Order no encontrado');

  const currentIdx = ESTADO_ORDEN.indexOf(order.status);
  const newIdx = ESTADO_ORDEN.indexOf(newStatus);

  if (newIdx !== currentIdx + 1) {
    throw new AppError(400, `No se puede cambiar de "${order.status}" a "${newStatus}"`);
  }

  const updated = await ordersRepo.updateStatus(id, newStatus, userId);
  if (!updated) throw new AppError(404, 'Order no encontrado');

  // Notificaciones asíncronas: al solicitante y a la empresa (sin bloquear la respuesta).
  // newStatus nunca es 'Solicitado' aquí (ver comprobación de newIdx arriba), por eso
  // coincide siempre con un OrderNotificationEvent válido.
  (async () => {
    try {
      const event = newStatus as OrderNotificationEvent;
      const prefs = await usersRepo.getOrderNotificationPrefs(updated.requesterId);
      if (shouldNotifyOrderEvent(prefs, updated.type, event)) {
        const destino = await resolveRequesterEmail(updated.requesterId);
        if (destino) await enviarSeguimientoEstado(updated, destino, newStatus);
      }
      await notificarEventoPedido(updated, event);
    } catch (err) {
      console.error('[ordersService] Error en notificaciones de advanceStatus:', err);
    }
  })();

  return updated;
}

export function getNextStatus(status: OrderStatus): OrderStatus | null {
  const idx = ESTADO_ORDEN.indexOf(status);
  if (idx < 0 || idx >= ESTADO_ORDEN.length - 1) return null;
  return ESTADO_ORDEN[idx + 1];
}

export async function updatePedido(
  id: number,
  data: { quantity?: number; desiredDeadline?: string | null; notes?: string | null },
  actingUser: { userId: number; role: UserRole },
): Promise<Order> {
  const order = await ordersRepo.findById(id);
  if (!order) throw new AppError(404, 'Order no encontrado');
  assertCanModifyOrder(order, actingUser);
  const updated = await ordersRepo.updatePedido(id, data);
  if (!updated) throw new AppError(404, 'Order no encontrado');

  // Un pedido editado sigue en "Solicitado"; se trata como parte del evento 'created'.
  (async () => {
    try {
      const prefs = await usersRepo.getOrderNotificationPrefs(updated.requesterId);
      if (shouldNotifyOrderEvent(prefs, updated.type, 'created')) {
        const destino = await resolveRequesterEmail(updated.requesterId);
        if (destino) await enviarActualizacionPedido(updated, destino);
      }
    } catch (err) {
      console.error('[ordersService] Error en notificaciones de updatePedido:', err);
    }
  })();

  return updated;
}

export async function deletePedido(id: number, actingUser: { userId: number; role: UserRole }): Promise<void> {
  const order = await ordersRepo.findById(id);
  if (!order) throw new AppError(404, 'Order no encontrado');
  assertCanModifyOrder(order, actingUser);
  await ordersRepo.deletePedido(id);
}

// Compras y admin gestionan cualquier pedido sin restricción de fase. Almacén solo puede
// editar/eliminar los pedidos que ellos mismos solicitaron, y solo mientras sigan "Solicitado"
// (una vez avanza de fase, ya ni el propio solicitante de almacén puede tocarlo).
function assertCanModifyOrder(order: Order, actingUser: { userId: number; role: UserRole }): void {
  if (actingUser.role === 'admin' || actingUser.role === 'compras') return;
  if (order.requesterId !== actingUser.userId) {
    throw new AppError(403, 'Solo puedes modificar los pedidos que tú mismo solicitaste');
  }
  if (order.status !== 'Solicitado') {
    throw new AppError(409, 'Solo puedes modificar tu pedido mientras esté en estado "Solicitado"');
  }
}

export async function toggleOcultoPedido(id: number): Promise<Order> {
  const order = await ordersRepo.toggleOculto(id);
  if (!order) throw new AppError(404, 'Order no encontrado');
  return order;
}
