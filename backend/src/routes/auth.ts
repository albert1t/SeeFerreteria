import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authService from '../services/authService.js';
import { authMiddleware, COOKIE_NAME } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { loginSchema, registerSchema, msalLoginSchema } from '../schemas/index.js';
import { env } from '../config/env.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiados intentos de login. Inténtalo más tarde.' },
});

router.post('/login', loginLimiter, validateBody(loginSchema), async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const { user, token } = await authService.login(username, password);

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.post('/register', loginLimiter, validateBody(registerSchema), async (req, res, next) => {
  try {
    const { username, password, name } = req.body;
    const { user, token } = await authService.register(username, name, password);

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.post('/msal-login', validateBody(msalLoginSchema), async (req, res, next) => {
  try {
    const { idToken } = req.body;
    const { user, token } = await authService.loginMicrosoft(idToken);

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user!.userId);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
