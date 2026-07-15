import { Router } from 'express';
import * as catalogosRepo from '../repositories/catalogos.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
const router = Router();
router.use(authMiddleware);
router.get('/familias', async (_req, res, next) => {
    try {
        const familias = await catalogosRepo.getFamilias();
        res.json(familias);
    }
    catch (err) {
        next(err);
    }
});
router.post('/familias', requirePermission('familias', 'create'), async (req, res, next) => {
    try {
        const { nombre, descripcion } = req.body;
        if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
            throw new AppError(400, 'El nombre de la familia es obligatorio');
        }
        const created = await catalogosRepo.createFamilia(nombre.trim(), descripcion?.trim() || null);
        if (!created) {
            throw new AppError(409, 'La familia ya existe');
        }
        res.status(201).json({ ok: true });
    }
    catch (err) {
        next(err);
    }
});
router.patch('/familias/:id', requirePermission('familias', 'edit'), async (req, res, next) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        if (isNaN(id))
            throw new AppError(400, 'ID inválido');
        const { nombre, descripcion } = req.body;
        if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
            throw new AppError(400, 'El nombre de la familia es obligatorio');
        }
        const updated = await catalogosRepo.updateFamilia(id, nombre.trim(), descripcion?.trim() || null);
        if (!updated) {
            throw new AppError(404, 'Familia no encontrada');
        }
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
});
router.delete('/familias/:id', requirePermission('familias', 'delete'), async (req, res, next) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        if (isNaN(id))
            throw new AppError(400, 'ID inválido');
        const deleted = await catalogosRepo.deleteFamilia(id);
        if (!deleted) {
            throw new AppError(404, 'Familia no encontrada');
        }
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
});
export default router;
