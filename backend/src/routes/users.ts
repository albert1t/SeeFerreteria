import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { updateRoleSchema, updateActiveSchema, userIdSchema } from '../schemas/index.js';
import * as usersRepo from '../repositories/users.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

router.use(authMiddleware, requireRole('admin'));

router.get('/', async (_req, res, next) => {
  try {
    const users = await usersRepo.findAll();
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.patch(
  '/:id/role',
  validateParams(userIdSchema),
  validateBody(updateRoleSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params as unknown as { id: number };
      const updated = await usersRepo.updateRole(id, req.body.role);
      if (!updated) {
        throw new AppError(404, 'Usuario no encontrado');
      }
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/:id/active',
  validateParams(userIdSchema),
  validateBody(updateActiveSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params as unknown as { id: number };
      const updated = await usersRepo.updateActive(id, req.body.isActive);
      if (!updated) {
        throw new AppError(404, 'Usuario no encontrado');
      }
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
