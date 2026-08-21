import { Router } from 'express';
import * as catalogsRepo from '../repositories/catalogs.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

router.use(authMiddleware);

router.get('/families', async (_req, res, next) => {
  try {
    const families = await catalogsRepo.getFamilies();
    res.json(families);
  } catch (err) {
    next(err);
  }
});

router.post('/families', requirePermission('families', 'create'), async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new AppError(400, 'El name de la family es obligatorio');
    }
    const created = await catalogsRepo.createFamilia(name.trim(), description?.trim() || null);
    if (!created) {
      throw new AppError(409, 'La family ya existe');
    }
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.patch('/families/:id', requirePermission('families', 'edit'), async (req, res, next) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) throw new AppError(400, 'ID inválido');
    const { name, description } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new AppError(400, 'El name de la family es obligatorio');
    }
    const updated = await catalogsRepo.updateFamilia(id, name.trim(), description?.trim() || null);
    if (!updated) {
      throw new AppError(404, 'Family no encontrada');
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/families/:id', requirePermission('families', 'delete'), async (req, res, next) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) throw new AppError(400, 'ID inválido');
    const deleted = await catalogsRepo.deleteFamilia(id);
    if (!deleted) {
      throw new AppError(404, 'Family no encontrada');
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
