import { Router } from 'express';
import * as productsService from '../services/productsService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', async (_req, res, next) => {
  try {
    const panels = await productsService.getPanels();
    res.json(panels);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/cubetas', async (req, res, next) => {
  try {
    const panel = String(req.params.id).toUpperCase();
    const incluirOcultos = req.user?.role === 'admin' && req.query.incluirOcultos === 'true';
    const cubetas = await productsService.getCubetasPanel(panel, incluirOcultos);
    res.json({ panel, cubetas });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/ocupacion', async (req, res, next) => {
  try {
    const panel = String(req.params.id).toUpperCase();
    const ocupacion = await productsService.getPanelOcupacion(panel);
    res.json({ panel, ocupacion });
  } catch (err) {
    next(err);
  }
});

export default router;
