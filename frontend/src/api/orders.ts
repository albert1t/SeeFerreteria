import { apiFetch } from './client';
import type { Order, OrderStatus, OrderHistory, OrderType } from '../types';

export interface OrdersFilters {
  busqueda?: string;
  type?: OrderType | 'Todos';
  fecha?: string;
  orden?: 'reciente' | 'antiguo';
  incluirFinalizados?: boolean;
  incluirOcultos?: boolean;
}

export function getOrders(filters: OrdersFilters = {}) {
  const params = new URLSearchParams();
  if (filters.busqueda) params.set('busqueda', filters.busqueda);
  if (filters.type && filters.type !== 'Todos') params.set('type', filters.type);
  if (filters.fecha) params.set('fecha', filters.fecha);
  if (filters.orden) params.set('orden', filters.orden);
  if (filters.incluirFinalizados) params.set('incluirFinalizados', 'true');
  if (filters.incluirOcultos) params.set('incluirOcultos', 'true');
  const qs = params.toString();
  return apiFetch<Order[]>(`/api/orders${qs ? `?${qs}` : ''}`);
}

export function getPedido(id: number) {
  return apiFetch<Order & { historial: OrderHistory[] }>(`/api/orders/${id}`);
}

export function getUrgentesCount() {
  return apiFetch<{ count: number }>('/api/orders/urgentes/count');
}

export function createOrder(data: {
  productId: number;
  type: OrderType;
  quantity?: number;
  desiredDeadline?: string | null;
  notes?: string | null;
}) {
  return apiFetch<Order>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateOrderStatus(id: number, status: OrderStatus) {
  return apiFetch<Order>(`/api/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function updatePedido(id: number, data: { quantity?: number; desiredDeadline?: string | null; notes?: string | null }) {
  return apiFetch<Order>(`/api/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deletePedido(id: number) {
  return apiFetch<void>(`/api/orders/${id}`, { method: 'DELETE' });
}

export function toggleOcultoPedido(id: number) {
  return apiFetch<Order>(`/api/orders/${id}/hidden`, { method: 'PATCH' });
}
