import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import bcrypt from 'bcrypt';
import {
  userIdSchema,
  createUserSchema,
  updateRoleSchema,
  updateActiveSchema,
  updatePermissionsSchema,
  allowedEmailSchema,
  allowedEmailUpdateSchema,
} from '../schemas/index.js';
import * as usersRepo from '../repositories/users.js';
import { AppError } from '../middleware/errorHandler.js';
import { getDefaultPermissions } from '../middleware/auth.js';

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

router.post('/', validateBody(createUserSchema), async (req, res, next) => {
  try {
    const { username, password, name, role, permissions } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const perms = permissions ?? getDefaultPermissions(role);
    const created = await usersRepo.createUser(username, passwordHash, name, role, perms);
    if (!created) {
      throw new AppError(409, 'El usuario ya existe');
    }
    res.status(201).json({ ok: true });
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
      const updated = await usersRepo.updateRoleAndPermissions(id, req.body.role);
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
  '/:id/permissions',
  validateParams(userIdSchema),
  validateBody(updatePermissionsSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params as unknown as { id: number };
      const updated = await usersRepo.updateRoleAndPermissions(id, req.body.role, req.body.permissions);
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

router.delete('/:id', validateParams(userIdSchema), async (req, res, next) => {
  try {
    const { id } = req.params as unknown as { id: number };
    const deleted = await usersRepo.deleteUser(id, req.user!.userId);
    if (!deleted) {
      throw new AppError(404, 'Usuario no encontrado');
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Allowed emails for MSAL
router.get('/allowed-emails', async (_req, res, next) => {
  try {
    const emails = await usersRepo.findAllowedEmails();
    res.json({ emails });
  } catch (err) {
    next(err);
  }
});

router.post('/allowed-emails', validateBody(allowedEmailSchema), async (req, res, next) => {
  try {
    const created = await usersRepo.createAllowedEmail(req.body.email, req.body.role, req.body.permissions);
    if (!created) {
      throw new AppError(409, 'El correo ya existe en la lista');
    }
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.patch(
  '/allowed-emails/:id',
  validateParams(userIdSchema),
  validateBody(allowedEmailUpdateSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params as unknown as { id: number };
      const updated = await usersRepo.updateAllowedEmail(id, req.body.role, req.body.isActive, req.body.permissions);
      if (!updated) {
        throw new AppError(404, 'Correo no encontrado');
      }
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
);

router.delete('/allowed-emails/:id', validateParams(userIdSchema), async (req, res, next) => {
  try {
    const { id } = req.params as unknown as { id: number };
    const deleted = await usersRepo.deleteAllowedEmail(id);
    if (!deleted) {
      throw new AppError(404, 'Correo no encontrado');
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
