import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import bcrypt from 'bcryptjs';
import { userIdSchema, createUserSchema, updateRoleSchema, updateActiveSchema, allowedEmailSchema, allowedEmailUpdateSchema, } from '../schemas/index.js';
import * as usersRepo from '../repositories/users.js';
import * as rolesRepo from '../repositories/roles.js';
import { AppError } from '../middleware/errorHandler.js';
const router = Router();
router.use(authMiddleware, requireRole('admin'));
function assertValidRole(role) {
    if (!rolesRepo.isValidRole(role)) {
        throw new AppError(400, `Rol inválido: ${role}`);
    }
    return role;
}
router.get('/roles', (_req, res) => {
    const roles = rolesRepo.getAllRolesSync().map((r) => ({ name: r.name, label: r.label }));
    res.json({ roles });
});
router.get('/', async (_req, res, next) => {
    try {
        const users = await usersRepo.findAll();
        res.json({ users });
    }
    catch (err) {
        next(err);
    }
});
router.post('/', validateBody(createUserSchema), async (req, res, next) => {
    try {
        const { username, password, name } = req.body;
        const role = assertValidRole(req.body.role);
        const passwordHash = await bcrypt.hash(password, 10);
        const created = await usersRepo.createUser(username, passwordHash, name, role);
        if (!created) {
            throw new AppError(409, 'El usuario ya existe');
        }
        res.status(201).json({ ok: true });
    }
    catch (err) {
        next(err);
    }
});
router.patch('/:id/role', validateParams(userIdSchema), validateBody(updateRoleSchema), async (req, res, next) => {
    try {
        const { id } = req.params;
        const role = assertValidRole(req.body.role);
        const updated = await usersRepo.updateRole(id, role);
        if (!updated) {
            throw new AppError(404, 'Usuario no encontrado');
        }
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
});
router.patch('/:id/active', validateParams(userIdSchema), validateBody(updateActiveSchema), async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await usersRepo.updateActive(id, req.body.isActive);
        if (!updated) {
            throw new AppError(404, 'Usuario no encontrado');
        }
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', validateParams(userIdSchema), async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await usersRepo.deleteUser(id, req.user.userId);
        if (!deleted) {
            throw new AppError(404, 'Usuario no encontrado');
        }
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
});
// Allowed emails para MSAL
router.get('/allowed-emails', async (_req, res, next) => {
    try {
        const emails = await usersRepo.findAllowedEmails();
        res.json({ emails });
    }
    catch (err) {
        next(err);
    }
});
router.post('/allowed-emails', validateBody(allowedEmailSchema), async (req, res, next) => {
    try {
        const role = assertValidRole(req.body.role);
        const created = await usersRepo.createAllowedEmail(req.body.email, role);
        if (!created) {
            throw new AppError(409, 'El correo ya existe en la lista');
        }
        res.status(201).json({ ok: true });
    }
    catch (err) {
        next(err);
    }
});
router.patch('/allowed-emails/:id', validateParams(userIdSchema), validateBody(allowedEmailUpdateSchema), async (req, res, next) => {
    try {
        const { id } = req.params;
        const role = assertValidRole(req.body.role);
        const updated = await usersRepo.updateAllowedEmail(id, role, req.body.isActive);
        if (!updated) {
            throw new AppError(404, 'Correo no encontrado');
        }
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
});
router.delete('/allowed-emails/:id', validateParams(userIdSchema), async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await usersRepo.deleteAllowedEmail(id);
        if (!deleted) {
            throw new AppError(404, 'Correo no encontrado');
        }
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
});
export default router;
