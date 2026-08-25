import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { notificationSettingsSchema } from '../schemas/index.js';
import * as settingsService from '../services/settingsService.js';

const router = Router();

router.use(authMiddleware, requireRole('admin'));

router.get('/notifications', async (_req, res, next) => {
  try {
    const settings = await settingsService.getNotificationSettings();
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

router.put('/notifications', validateBody(notificationSettingsSchema), async (req, res, next) => {
  try {
    const settings = await settingsService.updateNotificationSettings(req.body);
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

export default router;
