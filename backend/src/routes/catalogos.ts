import { Router } from 'express';
import * as catalogosRepo from '../repositories/catalogos.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/familias', async (_req, res, next) => {
  try {
    const familias = await catalogosRepo.getFamilias();
    res.json(familias);
  } catch (err) {
    next(err);
  }
});

export default router;
