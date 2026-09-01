import * as ordersRepo from '../repositories/orders.js';
import * as productsRepo from '../repositories/products.js';
import * as usersRepo from '../repositories/users.js';
import { AppError } from '../middleware/errorHandler.js';
import { enviarAcuseSolicitante, enviarSeguimientoEstado, esEmailValido, notificarNuevoPedido, } from './mailService.js';
const ESTADO_ORDEN = ['Solicitado', 'Pedido realizado', 'Pedido recibido', 'Finalizado'];
export async function listOrders(filters) {
    return ordersRepo.findAll(filters);
}
export async function getPedido(id) {
    const order = await ordersRepo.findById(id);
    if (!order)
        throw new AppError(404, 'Order no encontrado');
    const historial = await ordersRepo.getHistorial(id);
    return { ...order, historial };
}
export async function getOrdersByProduct(productId) {
    return ordersRepo.findByProductId(productId);
}
export async function countUrgentes() {
    return ordersRepo.countUrgentes();
}
export async function createOrder(data, requesterId) {
    const product = await productsRepo.findById(data.productId);
    if (!product)
        throw new AppError(404, 'Product no encontrado');
    let quantity;
    let desiredDeadline;
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
            const requester = await usersRepo.findById(requesterId);
            if (requester && esEmailValido(requester.username)) {
                await enviarAcuseSolicitante(order, requester.username);
            }
            await notificarNuevoPedido(order);
        }
        catch (err) {
            console.error('[ordersService] Error en notificaciones de createOrder:', err);
        }
    })();
    return order;
}
export async function advanceStatus(id, newStatus, userId) {
    const order = await ordersRepo.findById(id);
    if (!order)
        throw new AppError(404, 'Order no encontrado');
    const currentIdx = ESTADO_ORDEN.indexOf(order.status);
    const newIdx = ESTADO_ORDEN.indexOf(newStatus);
    if (newIdx !== currentIdx + 1) {
        throw new AppError(400, `No se puede cambiar de "${order.status}" a "${newStatus}"`);
    }
    const updated = await ordersRepo.updateStatus(id, newStatus, userId);
    if (!updated)
        throw new AppError(404, 'Order no encontrado');
    // Notificación de seguimiento al requester (sin bloquear la respuesta)
    (async () => {
        try {
            const requester = await usersRepo.findById(updated.requesterId);
            if (requester && esEmailValido(requester.username)) {
                await enviarSeguimientoEstado(updated, requester.username, newStatus);
            }
        }
        catch (err) {
            console.error('[ordersService] Error en notificaciones de advanceStatus:', err);
        }
    })();
    return updated;
}
export function getNextStatus(status) {
    const idx = ESTADO_ORDEN.indexOf(status);
    if (idx < 0 || idx >= ESTADO_ORDEN.length - 1)
        return null;
    return ESTADO_ORDEN[idx + 1];
}
export async function updatePedido(id, data) {
    const order = await ordersRepo.findById(id);
    if (!order)
        throw new AppError(404, 'Order no encontrado');
    if (order.status !== 'Solicitado') {
        throw new AppError(409, 'Solo se puede editar un pedido en estado "Solicitado"');
    }
    const updated = await ordersRepo.updatePedido(id, data);
    if (!updated)
        throw new AppError(404, 'Order no encontrado');
    return updated;
}
export async function deletePedido(id) {
    const order = await ordersRepo.findById(id);
    if (!order)
        throw new AppError(404, 'Order no encontrado');
    if (order.status !== 'Solicitado') {
        throw new AppError(409, 'Solo se puede eliminar un pedido en estado "Solicitado"');
    }
    await ordersRepo.deletePedido(id);
}
export async function toggleOcultoPedido(id) {
    const order = await ordersRepo.toggleOculto(id);
    if (!order)
        throw new AppError(404, 'Order no encontrado');
    return order;
}
