import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { normalizeUserRole } from '../types/index.js';
import { getPermissionsForRole } from '../repositories/roles.js';
import { AppError } from './errorHandler.js';
const COOKIE_NAME = 'see_token';
export function getTokenFromRequest(req) {
    const cookie = req.cookies?.[COOKIE_NAME];
    if (cookie)
        return cookie;
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer '))
        return auth.slice(7);
    return null;
}
export function signToken(payload) {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}
export function authMiddleware(req, _res, next) {
    const token = getTokenFromRequest(req);
    if (!token) {
        next(new AppError(401, 'No autenticado'));
        return;
    }
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.user = { ...decoded, role: normalizeUserRole(String(decoded.role)) };
        next();
    }
    catch {
        next(new AppError(401, 'Token inválido o expirado'));
    }
}
export function requireRole(...roles) {
    return (req, _res, next) => {
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
export function requirePermission(resource, action) {
    return (req, _res, next) => {
        if (!req.user) {
            next(new AppError(401, 'No autenticado'));
            return;
        }
        const perms = getPermissionsForRole(req.user.role);
        if (perms.admin || perms[resource][action]) {
            next();
            return;
        }
        next(new AppError(403, 'No tienes permisos para esta acción'));
    };
}
export { COOKIE_NAME };
