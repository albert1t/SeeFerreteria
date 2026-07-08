import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import * as usersRepo from '../repositories/users.js';
import { signToken, getDefaultPermissions } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { env } from '../config/env.js';
import type { JwtPayload, User, UserRole, Permissions } from '../types/index.js';

function buildTokenResponse(user: User) {
  const payload: JwtPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
    permissions: user.permissions,
  };
  return { user, token: signToken(payload) };
}

export async function login(username: string, password: string): Promise<{ user: User; token: string }> {
  const user = await usersRepo.findByUsername(username);
  if (!user) {
    throw new AppError(401, 'Credenciales incorrectas');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Credenciales incorrectas');
  }

  const { passwordHash: _, ...safeUser } = user;
  return buildTokenResponse(safeUser);
}

export async function register(username: string, name: string, password: string): Promise<{ user: User; token: string }> {
  const existing = await usersRepo.findByUsername(username);
  if (existing) {
    throw new AppError(409, 'El usuario ya existe');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const role: UserRole = 'user';
  const created = await usersRepo.createUser(username, passwordHash, name, role);
  if (!created) {
    throw new AppError(409, 'El usuario ya existe');
  }

  const user = await usersRepo.findByUsername(username);
  if (!user) {
    throw new AppError(500, 'No se pudo crear el usuario');
  }

  const { passwordHash: _, ...safeUser } = user;
  return buildTokenResponse(safeUser);
}

async function verifyMsalToken(idToken: string): Promise<JWTPayload> {
  if (!env.AZURE_AD_CLIENT_ID) {
    throw new AppError(500, 'Azure AD no está configurado en el servidor');
  }

  const unverified = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64url').toString()) as { tid?: string };
  const tenantId = unverified.tid;
  if (!tenantId) {
    throw new AppError(401, 'Token de Microsoft inválido: falta tid');
  }

  const issuer = `https://login.microsoftonline.com/${tenantId}/v2.0`;
  const jwks = createRemoteJWKSet(new URL(`https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`));
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer,
    audience: env.AZURE_AD_CLIENT_ID,
  });

  return payload;
}

export async function loginMicrosoft(idToken: string): Promise<{ user: User; token: string }> {
  const payload = await verifyMsalToken(idToken);
  const username = (payload.email || payload.preferred_username) as string | undefined;
  if (!username) {
    throw new AppError(401, 'Token de Microsoft inválido');
  }

  const name = (payload.name || username) as string;

  // Check whitelist — solo emails autorizados pueden acceder
  const allowed = await usersRepo.findAllowedEmailByEmail(username);
  if (!allowed || !allowed.isActive) {
    throw new AppError(403, 'No tienes permiso para acceder');
  }

  let user = await usersRepo.findByUsernameAll(username);

  if (!user) {
    const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 10);
    const role = allowed.role;
    const permissions = allowed.permissions ?? getDefaultPermissions(role);
    const created = await usersRepo.createUser(username, passwordHash, name, role, permissions);
    if (!created) {
      throw new AppError(409, 'El usuario ya existe');
    }
    user = await usersRepo.findByUsernameAll(username);
    if (!user) {
      throw new AppError(500, 'No se pudo crear el usuario de Microsoft');
    }
  } else if (!user.isActive) {
    await usersRepo.updateActive(user.id, true);
    user = await usersRepo.findByUsernameAll(username);
  }

  const { passwordHash: _, ...safeUser } = user;
  return buildTokenResponse(safeUser);
}

export async function getMe(userId: number): Promise<User> {
  const user = await usersRepo.findById(userId);
  if (!user) {
    throw new AppError(404, 'Usuario no encontrado');
  }
  return user;
}
