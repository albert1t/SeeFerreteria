import { getPool, sql } from '../config/db.js';
import type { User, UserWithHash, AllowedEmail, UserRole, Permissions } from '../types/index.js';
import { getDefaultPermissions } from '../middleware/auth.js';

function deepMergePerms(stored: Partial<Permissions>, defaults: Permissions): Permissions {
  const result = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof Permissions)[]) {
    if (key === 'admin' && typeof stored.admin === 'boolean') {
      result.admin = stored.admin;
    } else if (key !== 'admin' && stored[key] && typeof stored[key] === 'object') {
      result[key] = { ...defaults[key], ...stored[key] as any };
    }
  }
  return result;
}

function parsePermissions(json: string | null | undefined, role: UserRole): Permissions {
  const defaults = getDefaultPermissions(role);
  if (!json) return defaults;
  try {
    const stored = JSON.parse(json) as Partial<Permissions>;
    return deepMergePerms(stored, defaults);
  } catch {
    return defaults;
  }
}

function mapUser(record: Record<string, unknown>): User {
  const role = record.role as UserRole;
  return {
    id: record.id as number,
    username: record.username as string,
    name: record.name as string,
    role,
    isActive: record.isActive as boolean,
    permissions: parsePermissions(record.permissions as string | undefined, role),
  };
}

export async function findByUsername(username: string): Promise<UserWithHash | null> {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, username, passwordHash, name, role, isActive, permissions FROM Users WHERE username = ? AND isActive = 1',
    [username]
  );
  const row = (rows as any[])[0];
  if (!row) return null;
  return { ...mapUser(row), passwordHash: row.passwordHash as string };
}

export async function findByUsernameAll(username: string): Promise<UserWithHash | null> {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, username, passwordHash, name, role, isActive, permissions FROM Users WHERE username = ?',
    [username]
  );
  const row = (rows as any[])[0];
  if (!row) return null;
  return { ...mapUser(row), passwordHash: row.passwordHash as string };
}

export async function findById(id: number): Promise<User | null> {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, username, name, role, isActive, permissions FROM Users WHERE id = ? AND isActive = 1',
    [id]
  );
  const row = (rows as any[])[0];
  return row ? mapUser(row) : null;
}

export async function createUser(
  username: string,
  passwordHash: string,
  name: string,
  role: UserRole,
  permissions?: Permissions | null,
): Promise<boolean> {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT 1 AS existsUser FROM Users WHERE username = ? LIMIT 1', [username]);
  if ((rows as any[]).length > 0) return false;

  const perms = permissions ?? getDefaultPermissions(role);
  await pool.query(
    'INSERT INTO Users (username, passwordHash, name, role, permissions) VALUES (?, ?, ?, ?, ?)',
    [username, passwordHash, name, role, JSON.stringify(perms)]
  );
  return true;
}

export async function upsertUser(
  username: string,
  passwordHash: string,
  name: string,
  role: UserRole,
  permissions?: Permissions | null,
): Promise<void> {
  const pool = await getPool();
  const perms = permissions ?? getDefaultPermissions(role);
  const [existing] = await pool.query('SELECT id FROM Users WHERE username = ?', [username]);
  if ((existing as any[]).length > 0) {
    await pool.query(
      'UPDATE Users SET passwordHash = ?, name = ?, role = ?, permissions = ?, updatedAt = UTC_TIMESTAMP(6) WHERE username = ?',
      [passwordHash, name, role, JSON.stringify(perms), username]
    );
  } else {
    await pool.query(
      'INSERT INTO Users (username, passwordHash, name, role, permissions) VALUES (?, ?, ?, ?, ?)',
      [username, passwordHash, name, role, JSON.stringify(perms)]
    );
  }
}

export async function findAll(): Promise<User[]> {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, username, name, role, isActive, permissions FROM Users ORDER BY name'
  );
  return (rows as any[]).map(mapUser);
}

export async function updateRoleAndPermissions(
  id: number,
  role: UserRole,
  permissions?: Permissions | null,
): Promise<boolean> {
  const pool = await getPool();
  const perms = permissions ?? getDefaultPermissions(role);
  const [result] = await pool.query(
    'UPDATE Users SET role = ?, permissions = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?',
    [role, JSON.stringify(perms), id]
  );
  return (result as any).affectedRows > 0;
}

export async function updateActive(id: number, isActive: boolean): Promise<boolean> {
  const pool = await getPool();
  const [result] = await pool.query(
    'UPDATE Users SET isActive = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?',
    [isActive ? 1 : 0, id]
  );
  return (result as any).affectedRows > 0;
}

export async function deleteUser(id: number, reassignToId: number): Promise<boolean> {
  const pool = await getPool();
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    await connection.query('UPDATE Pedidos SET solicitanteId = ? WHERE solicitanteId = ?', [reassignToId, id]);
    await connection.query('DELETE FROM PedidosEstadoHistorial WHERE usuarioId = ?', [id]);
    const [result] = await connection.query('DELETE FROM Users WHERE id = ?', [id]);
    await connection.commit();
    return (result as any).affectedRows > 0;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// Allowed emails for MSAL
export async function findAllowedEmails(): Promise<AllowedEmail[]> {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT id, email, role, isActive, permissions FROM AllowedEmails ORDER BY email');
  return (rows as any[]).map((row: any) => ({
    id: row.id as number,
    email: row.email as string,
    role: row.role as UserRole,
    isActive: row.isActive as boolean,
    permissions: parsePermissions(row.permissions as string | undefined, row.role as UserRole),
  }));
}

export async function findAllowedEmailByEmail(email: string): Promise<AllowedEmail | null> {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, email, role, isActive, permissions FROM AllowedEmails WHERE email = ?',
    [email]
  );
  const row = (rows as any[])[0];
  if (!row) return null;
  return {
    id: row.id as number,
    email: row.email as string,
    role: row.role as UserRole,
    isActive: row.isActive as boolean,
    permissions: parsePermissions(row.permissions as string | undefined, row.role as UserRole),
  };
}

export async function createAllowedEmail(
  email: string,
  role: UserRole = 'user',
  permissions?: Permissions | null,
): Promise<boolean> {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT 1 AS existsEmail FROM AllowedEmails WHERE email = ? LIMIT 1', [email]);
  if ((rows as any[]).length > 0) return false;

  const perms = permissions ?? getDefaultPermissions(role);
  await pool.query(
    'INSERT INTO AllowedEmails (email, role, permissions) VALUES (?, ?, ?)',
    [email, role, JSON.stringify(perms)]
  );
  return true;
}

export async function updateAllowedEmail(
  id: number,
  role: UserRole,
  isActive: boolean,
  permissions?: Permissions | null,
): Promise<boolean> {
  const pool = await getPool();
  if (permissions) {
    const [result] = await pool.query(
      'UPDATE AllowedEmails SET role = ?, isActive = ?, permissions = ? WHERE id = ?',
      [role, isActive ? 1 : 0, JSON.stringify(permissions), id]
    );
    return (result as any).affectedRows > 0;
  }
  const [result] = await pool.query(
    'UPDATE AllowedEmails SET role = ?, isActive = ? WHERE id = ?',
    [role, isActive ? 1 : 0, id]
  );
  return (result as any).affectedRows > 0;
}

export async function deleteAllowedEmail(id: number): Promise<boolean> {
  const pool = await getPool();
  const [result] = await pool.query('DELETE FROM AllowedEmails WHERE id = ?', [id]);
  return (result as any).affectedRows > 0;
}
