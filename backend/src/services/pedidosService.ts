import * as pedidosRepo from '../repositories/pedidos.js';
import * as recambiosRepo from '../repositories/recambios.js';
import * as usersRepo from '../repositories/users.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  enviarAcuseSolicitante,
  enviarSeguimientoEstado,
  esEmailValido,
  notificarNuevoPedido,
} from './mailService.js';
import type { Pedido, PedidoEstado, PedidoHistorial, PedidoTipo } from '../types/index.js';

const ESTADO_ORDEN: PedidoEstado[] = ['Solicitado', 'Pedido realizado', 'Pedido recibido', 'Finalizado'];

export async function listPedidos(filters: {
  busqueda?: string;
  tipo?: PedidoTipo;
  fecha?: string;
  orden?: 'reciente' | 'antiguo';
  incluirFinalizados?: boolean;
  incluirOcultos?: boolean;
}): Promise<Pedido[]> {
  return pedidosRepo.findAll(filters);
}

export async function getPedido(id: number): Promise<Pedido & { historial: PedidoHistorial[] }> {
  const pedido = await pedidosRepo.findById(id);
  if (!pedido) throw new AppError(404, 'Pedido no encontrado');
  const historial = await pedidosRepo.getHistorial(id);
  return { ...pedido, historial };
}

export async function getPedidosByRecambio(recambioId: number): Promise<Pedido[]> {
  return pedidosRepo.findByRecambioId(recambioId);
}

export async function countUrgentes(): Promise<number> {
  return pedidosRepo.countUrgentes();
}

export async function createPedido(
  data: {
    recambioId: number;
    tipo: PedidoTipo;
    cantidad?: number;
    plazoDeseado?: string | null;
    observaciones?: string | null;
  },
  solicitanteId: number,
): Promise<Pedido> {
  const recambio = await recambiosRepo.findById(data.recambioId);
  if (!recambio) throw new AppError(404, 'Recambio no encontrado');

  let cantidad: number;
  let plazoDeseado: string | null;
  let prioritario = false;

  switch (data.tipo) {
    case 'Reposición':
      cantidad = recambio.nReposicion ?? 1;
      plazoDeseado = recambio.plazoEntrega;
      break;
    case 'Solicitud':
      if (!data.cantidad || !data.plazoDeseado) {
        throw new AppError(400, 'Solicitud requiere cantidad y plazo deseado');
      }
      cantidad = data.cantidad;
      plazoDeseado = data.plazoDeseado;
      break;
    case 'Solicitud Express':
      cantidad = data.cantidad ?? recambio.nReposicion ?? 1;
      plazoDeseado = data.plazoDeseado ?? recambio.plazoEntrega;
      prioritario = true;
      break;
    default:
      throw new AppError(400, 'Tipo de pedido inválido');
  }

  const pedido = await pedidosRepo.create({
    recambioId: data.recambioId,
    solicitanteId,
    tipo: data.tipo,
    cantidad,
    plazoDeseado,
    prioritario,
    observaciones: data.observaciones ?? null,
  });

  // Notificaciones asíncronas: nunca deben afectar la respuesta de la API
  (async () => {
    try {
      const solicitante = await usersRepo.findById(solicitanteId);
      if (solicitante && esEmailValido(solicitante.username)) {
        await enviarAcuseSolicitante(pedido, solicitante.username);
      }
      await notificarNuevoPedido(pedido);
    } catch (err) {
      console.error('[pedidosService] Error en notificaciones de createPedido:', err);
    }
  })();

  return pedido;
}

export async function advanceEstado(id: number, nuevoEstado: PedidoEstado, usuarioId: number): Promise<Pedido> {
  const pedido = await pedidosRepo.findById(id);
  if (!pedido) throw new AppError(404, 'Pedido no encontrado');

  const currentIdx = ESTADO_ORDEN.indexOf(pedido.estado);
  const newIdx = ESTADO_ORDEN.indexOf(nuevoEstado);

  if (newIdx !== currentIdx + 1) {
    throw new AppError(400, `No se puede cambiar de "${pedido.estado}" a "${nuevoEstado}"`);
  }

  const updated = await pedidosRepo.updateEstado(id, nuevoEstado, usuarioId);
  if (!updated) throw new AppError(404, 'Pedido no encontrado');

  // Notificación de seguimiento al solicitante (sin bloquear la respuesta)
  (async () => {
    try {
      const solicitante = await usersRepo.findById(updated.solicitanteId);
      if (solicitante && esEmailValido(solicitante.username)) {
        await enviarSeguimientoEstado(updated, solicitante.username, nuevoEstado);
      }
    } catch (err) {
      console.error('[pedidosService] Error en notificaciones de advanceEstado:', err);
    }
  })();

  return updated;
}

export function getNextEstado(estado: PedidoEstado): PedidoEstado | null {
  const idx = ESTADO_ORDEN.indexOf(estado);
  if (idx < 0 || idx >= ESTADO_ORDEN.length - 1) return null;
  return ESTADO_ORDEN[idx + 1];
}

export async function updatePedido(id: number, data: { cantidad?: number; plazoDeseado?: string | null; observaciones?: string | null }): Promise<Pedido> {
  const pedido = await pedidosRepo.findById(id);
  if (!pedido) throw new AppError(404, 'Pedido no encontrado');
  const updated = await pedidosRepo.updatePedido(id, data);
  if (!updated) throw new AppError(404, 'Pedido no encontrado');
  return updated;
}

export async function deletePedido(id: number): Promise<void> {
  const pedido = await pedidosRepo.findById(id);
  if (!pedido) throw new AppError(404, 'Pedido no encontrado');
  await pedidosRepo.deletePedido(id);
}

export async function toggleOcultoPedido(id: number): Promise<Pedido> {
  const pedido = await pedidosRepo.toggleOculto(id);
  if (!pedido) throw new AppError(404, 'Pedido no encontrado');
  return pedido;
}
