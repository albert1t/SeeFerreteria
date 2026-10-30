import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { notificationSettingsSchema, userNotificationSettingsSchema } from '../schemas/index.js';
import * as settingsService from '../services/settingsService.js';
import * as usersRepo from '../repositories/users.js';
const router = Router();
router.use(authMiddleware);
router.get('/my-notifications', async (req, res, next) => {
    try {
        res.json({ emailOrdersMode: await usersRepo.getEmailOrdersMode(req.user.userId) });
    }
    catch (err) {
        next(err);
    }
});
router.put('/my-notifications', validateBody(userNotificationSettingsSchema), async (req, res, next) => {
    try {
        await usersRepo.updateEmailOrdersMode(req.user.userId, req.body.emailOrdersMode);
        res.json({ emailOrdersMode: req.body.emailOrdersMode });
    }
    catch (err) {
        next(err);
    }
});
router.use(requireRole('admin'));
router.get('/notifications', async (_req, res, next) => {
    try {
        const settings = await settingsService.getNotificationSettings();
        res.json(settings);
    }
    catch (err) {
        next(err);
    }
});
router.put('/notifications', validateBody(notificationSettingsSchema), async (req, res, next) => {
    try {
        const settings = await settingsService.updateNotificationSettings(req.body);
        res.json(settings);
    }
    catch (err) {
        next(err);
    }
});
export default router;
