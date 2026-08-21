import { Router } from 'express';
import * as ordersService from '../services/ordersService.js';
import { enviarCorreoDePrueba, esEmailValido, getMailConfigStatus } from '../services/mailService.js';
import { env } from '../config/env.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { orderCreateSchema, orderStatusSchema, orderUpdateSchema, ordersQuerySchema } from '../schemas/index.js';
const router = Router();
router.use(authMiddleware);
// Endpoint de prueba para verificar configuración SMTP y enviar un correo de prueba
router.post('/test-email', async (req, res, next) => {
    try {
        const to = req.user?.username && esEmailValido(req.user.username)
            ? req.user.username
            : env.NOTIFY_EMAIL;
        const info = await enviarCorreoDePrueba(to);
        res.json({ ok: true, to, info, config: getMailConfigStatus() });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message, config: getMailConfigStatus() });
    }
});
router.get('/urgentes/count', async (_req, res, next) => {
    try {
        const count = await ordersService.countUrgentes();
        res.json({ count });
    }
    catch (err) {
        next(err);
    }
});
router.get('/', validateQuery(ordersQuerySchema), async (req, res, next) => {
    try {
        const q = req.query;
        const orders = await ordersService.listOrders({
            busqueda: q.busqueda,
            type: q.type,
            fecha: q.fecha,
            orden: q.orden,
            incluirFinalizados: q.incluirFinalizados === 'true',
            incluirOcultos: q.incluirOcultos === 'true',
        });
        res.json(orders);
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        const order = await ordersService.getPedido(id);
        res.json(order);
    }
    catch (err) {
        next(err);
    }
});
router.post('/', validateBody(orderCreateSchema), async (req, res, next) => {
    try {
        const order = await ordersService.createOrder(req.body, req.user.userId);
        res.status(201).json(order);
    }
    catch (err) {
        next(err);
    }
});
router.patch('/:id/status', validateBody(orderStatusSchema), async (req, res, next) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        const order = await ordersService.advanceStatus(id, req.body.status, req.user.userId);
        res.json(order);
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', requirePermission('orders', 'edit'), validateBody(orderUpdateSchema), async (req, res, next) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        const order = await ordersService.updatePedido(id, req.body);
        res.json(order);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', requirePermission('orders', 'delete'), async (req, res, next) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        await ordersService.deletePedido(id);
        res.status(204).end();
    }
    catch (err) {
        next(err);
    }
});
router.patch('/:id/hidden', requirePermission('orders', 'edit'), async (req, res, next) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        const order = await ordersService.toggleOcultoPedido(id);
        res.json(order);
    }
    catch (err) {
        next(err);
    }
});
export default router;
