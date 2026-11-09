import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { normalizeUserRole, type JwtPayload, type UserRole } from '../types/index.js';
import { getPermissionsForRole } from '../repositories/roles.js';
import { AppError } from './errorHandler.js';

const COOKIE_NAME = 'see_token';

export function getTokenFromRequest(req: Request): string | null {
  const cookie = req.cookies?.[COOKIE_NAME];
  if (cookie) return cookie;
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const token = getTokenFromRequest(req);
  if (!token) {
    next(new AppError(401, 'No autenticado'));
    return;
  }
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = { ...decoded, role: normalizeUserRole(String(decoded.role)) };
    next();
  } catch {
    next(new AppError(401, 'Token inválido o expirado'));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'No autenticado'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError(403, 'No tienes permisos para esta acción'));
      return;
    }
    next();
  };
}

type Resource = 'orders' | 'products' | 'families' | 'tarifas';
type Action = 'create' | 'view' | 'edit' | 'delete';

export function requirePermission(resource: Resource, action: Action) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'No autenticado'));
      return;
    }
    const perms = getPermissionsForRole(req.user.role);
    if (perms.admin || (perms[resource] as unknown as Record<string, boolean>)[action]) {
      next();
      return;
    }
    next(new AppError(403, 'No tienes permisos para esta acción'));
  };
}

export { COOKIE_NAME };
