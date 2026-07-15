import { Router } from 'express';
import * as recambiosService from '../services/recambiosService.js';
import { authMiddleware } from '../middleware/auth.js';
const router = Router();
router.use(authMiddleware);
router.get('/', async (_req, res, next) => {
    try {
        const paneles = await recambiosService.getPaneles();
        res.json(paneles);
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id/cubetas', async (req, res, next) => {
    try {
        const panel = String(req.params.id).toUpperCase();
        const incluirOcultos = req.user?.role === 'admin' && req.query.incluirOcultos === 'true';
        const cubetas = await recambiosService.getCubetasPanel(panel, incluirOcultos);
        res.json({ panel, cubetas });
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id/ocupacion', async (req, res, next) => {
    try {
        const panel = String(req.params.id).toUpperCase();
        const ocupacion = await recambiosService.getPanelOcupacion(panel);
        res.json({ panel, ocupacion });
    }
    catch (err) {
        next(err);
    }
});
export default router;
