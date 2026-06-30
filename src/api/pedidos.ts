import { apiFetch } from './client';
import type { Pedido, PedidoEstado, PedidoHistorial, PedidoTipo } from '../types';

export interface PedidosFilters {
  busqueda?: string;
  tipo?: PedidoTipo | 'Todos';
  fecha?: string;
  orden?: 'reciente' | 'antiguo';
  incluirFinalizados?: boolean;
}

export function getPedidos(filters: PedidosFilters = {}) {
  const params = new URLSearchParams();
  if (filters.busqueda) params.set('busqueda', filters.busqueda);
  if (filters.tipo && filters.tipo !== 'Todos') params.set('tipo', filters.tipo);
  if (filters.fecha) params.set('fecha', filters.fecha);
  if (filters.orden) params.set('orden', filters.orden);
  if (filters.incluirFinalizados) params.set('incluirFinalizados', 'true');
  const qs = params.toString();
  return apiFetch<Pedido[]>(`/api/pedidos${qs ? `?${qs}` : ''}`);
}

export function getPedido(id: number) {
  return apiFetch<Pedido & { historial: PedidoHistorial[] }>(`/api/pedidos/${id}`);
}

export function getUrgentesCount() {
  return apiFetch<{ count: number }>('/api/pedidos/urgentes/count');
}

export function createPedido(data: {
  recambioId: number;
  tipo: PedidoTipo;
  cantidad?: number;
  plazoDeseado?: string | null;
  observaciones?: string | null;
}) {
  return apiFetch<Pedido>('/api/pedidos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updatePedidoEstado(id: number, estado: PedidoEstado) {
  return apiFetch<Pedido>(`/api/pedidos/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
}
