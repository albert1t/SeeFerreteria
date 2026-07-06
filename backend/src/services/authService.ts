import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import * as usersRepo from '../repositories/users.js';
import { signToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { env } from '../config/env.js';
import type { JwtPayload, User } from '../types/index.js';

function buildTokenResponse(user: User) {
  const payload: JwtPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
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
  const created = await usersRepo.createUser(username, passwordHash, name, 'user');
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

  // Extraer tenant del token sin verificar para soportar múltiples tenants
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
  let user = await usersRepo.findByUsername(username);

  if (!user) {
    const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 10);
    const created = await usersRepo.createUser(username, passwordHash, name, 'user');
    if (!created) {
      throw new AppError(409, 'El usuario ya existe');
    }
    user = await usersRepo.findByUsername(username);
    if (!user) {
      throw new AppError(500, 'No se pudo crear el usuario de Microsoft');
    }
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
