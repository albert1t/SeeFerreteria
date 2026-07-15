import { Router } from 'express';
import * as pedidosService from '../services/pedidosService.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { pedidoCreateSchema, pedidoEstadoSchema, pedidoUpdateSchema, pedidosQuerySchema } from '../schemas/index.js';
const router = Router();
router.use(authMiddleware);
router.get('/urgentes/count', async (_req, res, next) => {
    try {
        const count = await pedidosService.countUrgentes();
        res.json({ count });
    }
    catch (err) {
        next(err);
    }
});
router.get('/', validateQuery(pedidosQuerySchema), async (req, res, next) => {
    try {
        const q = req.query;
        const pedidos = await pedidosService.listPedidos({
            busqueda: q.busqueda,
            tipo: q.tipo,
            fecha: q.fecha,
            orden: q.orden,
            incluirFinalizados: q.incluirFinalizados === 'true',
            incluirOcultos: q.incluirOcultos === 'true',
        });
        res.json(pedidos);
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        const pedido = await pedidosService.getPedido(id);
        res.json(pedido);
    }
    catch (err) {
        next(err);
    }
});
router.post('/', validateBody(pedidoCreateSchema), async (req, res, next) => {
    try {
        const pedido = await pedidosService.createPedido(req.body, req.user.userId);
        res.status(201).json(pedido);
    }
    catch (err) {
        next(err);
    }
});
router.patch('/:id/estado', validateBody(pedidoEstadoSchema), async (req, res, next) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        const pedido = await pedidosService.advanceEstado(id, req.body.estado, req.user.userId);
        res.json(pedido);
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', requirePermission('pedidos', 'edit'), validateBody(pedidoUpdateSchema), async (req, res, next) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        const pedido = await pedidosService.updatePedido(id, req.body);
        res.json(pedido);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', requirePermission('pedidos', 'delete'), async (req, res, next) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        await pedidosService.deletePedido(id);
        res.status(204).end();
    }
    catch (err) {
        next(err);
    }
});
router.patch('/:id/oculto', requirePermission('pedidos', 'edit'), async (req, res, next) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        const pedido = await pedidosService.toggleOcultoPedido(id);
        res.json(pedido);
    }
    catch (err) {
        next(err);
    }
});
export default router;
