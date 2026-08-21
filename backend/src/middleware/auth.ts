import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { JwtPayload, UserRole } from '../types/index.js';
import { AppError } from './errorHandler.js';

// Mapa interno de permisos por rol. Se mantiene solo para no reescribir requirePermission.
type ResourceAction = 'create' | 'view' | 'edit' | 'delete';
interface ResourcePerms {
  create: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
}
interface ProductsPerms extends ResourcePerms {
  viewDataPage: boolean;
}
interface Permissions {
  admin: boolean;
  orders: ResourcePerms;
  products: ProductsPerms;
  families: ResourcePerms;
  tarifas: ResourcePerms;
}

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
    req.user = decoded;
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
    const perms = getDefaultPermissions(req.user.role);
    if (perms.admin || (perms[resource] as any)?.[action]) {
      next();
      return;
    }
    next(new AppError(403, 'No tienes permisos para esta acción'));
  };
}

function getDefaultPermissions(role: UserRole): Permissions {
  const full: Permissions = {
    admin: true,
    orders: { create: true, view: true, edit: true, delete: true },
    products: { create: true, view: true, edit: true, delete: true, viewDataPage: true },
    families: { create: true, view: true, edit: true, delete: true },
    tarifas: { create: true, view: true, edit: true, delete: true },
  };
  const user: Permissions = {
    admin: false,
    orders: { create: true, view: true, edit: true, delete: false },
    products: { create: false, view: true, edit: false, delete: false, viewDataPage: false },
    families: { create: false, view: false, edit: false, delete: false },
    tarifas: { create: false, view: false, edit: false, delete: false },
  };
  const viewer: Permissions = {
    admin: false,
    orders: { create: false, view: true, edit: false, delete: false },
    products: { create: false, view: true, edit: false, delete: false, viewDataPage: false },
    families: { create: false, view: false, edit: false, delete: false },
    tarifas: { create: false, view: false, edit: false, delete: false },
  };
  const operario: Permissions = {
    admin: false,
    orders: { create: true, view: true, edit: true, delete: false },
    products: { create: false, view: true, edit: false, delete: false, viewDataPage: false },
    families: { create: false, view: false, edit: false, delete: false },
    tarifas: { create: false, view: false, edit: false, delete: false },
  };

  switch (role) {
    case 'admin': return full;
    case 'operario': return operario;
    case 'viewer': return viewer;
    default: return user;
  }
}

export { COOKIE_NAME };
