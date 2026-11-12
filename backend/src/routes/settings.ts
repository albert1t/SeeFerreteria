import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { notificationSettingsSchema, userNotificationSettingsSchema } from '../schemas/index.js';
import * as settingsService from '../services/settingsService.js';
import * as usersRepo from '../repositories/users.js';
import { esEmailValido } from '../services/mailService.js';

const router = Router();

router.use(authMiddleware);

// Cuentas Microsoft (username = email) usan ese correo directo y no lo pueden cambiar aquí;
// solo las cuentas de contraseña pueden configurar un correo de notificación propio.
router.get('/my-notifications', async (req, res, next) => {
  try {
    const username = req.user!.username;
    const isEmailEditable = !esEmailValido(username);
    const [orderNotificationMatrix, notificationEmail] = await Promise.all([
      usersRepo.getOrderNotificationPrefs(req.user!.userId),
      usersRepo.getNotificationEmail(req.user!.userId),
    ]);
    res.json({
      orderNotificationMatrix,
      isEmailEditable,
      notificationEmail: isEmailEditable ? notificationEmail : username,
    });
  } catch (err) {
    next(err);
  }
});

router.put('/my-notifications', validateBody(userNotificationSettingsSchema), async (req, res, next) => {
  try {
    const isEmailEditable = !esEmailValido(req.user!.username);
    await usersRepo.updateOrderNotificationPrefs(req.user!.userId, req.body.orderNotificationMatrix);
    if (isEmailEditable && req.body.notificationEmail !== undefined) {
      await usersRepo.updateNotificationEmail(req.user!.userId, req.body.notificationEmail);
    }
    res.json({
      orderNotificationMatrix: req.body.orderNotificationMatrix,
      isEmailEditable,
      notificationEmail: isEmailEditable ? (req.body.notificationEmail ?? null) : req.user!.username,
    });
  } catch (err) {
    next(err);
  }
});

router.use(requireRole('admin'));

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
