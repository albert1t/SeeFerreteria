import * as pedidosRepo from '../repositories/pedidos.js';
import * as recambiosRepo from '../repositories/recambios.js';
import { AppError } from '../middleware/errorHandler.js';
const ESTADO_ORDEN = ['Solicitado', 'Pedido realizado', 'Pedido recibido', 'Finalizado'];
export async function listPedidos(filters) {
    return pedidosRepo.findAll(filters);
}
export async function getPedido(id) {
    const pedido = await pedidosRepo.findById(id);
    if (!pedido)
        throw new AppError(404, 'Pedido no encontrado');
    const historial = await pedidosRepo.getHistorial(id);
    return { ...pedido, historial };
}
export async function getPedidosByRecambio(recambioId) {
    return pedidosRepo.findByRecambioId(recambioId);
}
export async function countUrgentes() {
    return pedidosRepo.countUrgentes();
}
export async function createPedido(data, solicitanteId) {
    const recambio = await recambiosRepo.findById(data.recambioId);
    if (!recambio)
        throw new AppError(404, 'Recambio no encontrado');
    let cantidad;
    let plazoDeseado;
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
    return pedidosRepo.create({
        recambioId: data.recambioId,
        solicitanteId,
        tipo: data.tipo,
        cantidad,
        plazoDeseado,
        prioritario,
        observaciones: data.observaciones ?? null,
    });
}
export async function advanceEstado(id, nuevoEstado, usuarioId) {
    const pedido = await pedidosRepo.findById(id);
    if (!pedido)
        throw new AppError(404, 'Pedido no encontrado');
    const currentIdx = ESTADO_ORDEN.indexOf(pedido.estado);
    const newIdx = ESTADO_ORDEN.indexOf(nuevoEstado);
    if (newIdx !== currentIdx + 1) {
        throw new AppError(400, `No se puede cambiar de "${pedido.estado}" a "${nuevoEstado}"`);
    }
    const updated = await pedidosRepo.updateEstado(id, nuevoEstado, usuarioId);
    if (!updated)
        throw new AppError(404, 'Pedido no encontrado');
    return updated;
}
export function getNextEstado(estado) {
    const idx = ESTADO_ORDEN.indexOf(estado);
    if (idx < 0 || idx >= ESTADO_ORDEN.length - 1)
        return null;
    return ESTADO_ORDEN[idx + 1];
}
export async function updatePedido(id, data) {
    const pedido = await pedidosRepo.findById(id);
    if (!pedido)
        throw new AppError(404, 'Pedido no encontrado');
    const updated = await pedidosRepo.updatePedido(id, data);
    if (!updated)
        throw new AppError(404, 'Pedido no encontrado');
    return updated;
}
export async function deletePedido(id) {
    const pedido = await pedidosRepo.findById(id);
    if (!pedido)
        throw new AppError(404, 'Pedido no encontrado');
    await pedidosRepo.deletePedido(id);
}
export async function toggleOcultoPedido(id) {
    const pedido = await pedidosRepo.toggleOculto(id);
    if (!pedido)
        throw new AppError(404, 'Pedido no encontrado');
    return pedido;
}
