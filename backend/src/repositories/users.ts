import { getPool, sql } from '../config/db.js';
import type { User, UserWithHash, AllowedEmail, UserRole, Permissions } from '../types/index.js';
import { getDefaultPermissions } from '../middleware/auth.js';

function parsePermissions(json: string | null | undefined, role: UserRole): Permissions {
  if (!json) return getDefaultPermissions(role);
  try {
    return JSON.parse(json) as Permissions;
  } catch {
    return getDefaultPermissions(role);
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
  const result = await pool
    .request()
    .input('username', sql.NVarChar(50), username)
    .query(`
      SELECT id, username, passwordHash, name, role, isActive, permissions
      FROM Users WHERE username = @username AND isActive = 1
    `);
  const row = result.recordset[0];
  if (!row) return null;
  return { ...mapUser(row), passwordHash: row.passwordHash as string };
}

export async function findByUsernameAll(username: string): Promise<UserWithHash | null> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('username', sql.NVarChar(50), username)
    .query(`
      SELECT id, username, passwordHash, name, role, isActive, permissions
      FROM Users WHERE username = @username
    `);
  const row = result.recordset[0];
  if (!row) return null;
  return { ...mapUser(row), passwordHash: row.passwordHash as string };
}

export async function findById(id: number): Promise<User | null> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query(`
      SELECT id, username, name, role, isActive, permissions
      FROM Users WHERE id = @id AND isActive = 1
    `);
  const row = result.recordset[0];
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
  const exists = await pool
    .request()
    .input('username', sql.NVarChar(50), username)
    .query('SELECT TOP 1 1 AS existsUser FROM Users WHERE username = @username');

  if (exists.recordset.length > 0) {
    return false;
  }

  const perms = permissions ?? getDefaultPermissions(role);

  await pool
    .request()
    .input('username', sql.NVarChar(50), username)
    .input('passwordHash', sql.NVarChar(255), passwordHash)
    .input('name', sql.NVarChar(100), name)
    .input('role', sql.NVarChar(20), role)
    .input('permissions', sql.NVarChar(sql.MAX), JSON.stringify(perms))
    .query(`INSERT INTO Users (username, passwordHash, name, role, permissions) VALUES (@username, @passwordHash, @name, @role, @permissions)`);

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
  await pool
    .request()
    .input('username', sql.NVarChar(50), username)
    .input('passwordHash', sql.NVarChar(255), passwordHash)
    .input('name', sql.NVarChar(100), name)
    .input('role', sql.NVarChar(20), role)
    .input('permissions', sql.NVarChar(sql.MAX), JSON.stringify(perms))
    .query(`
      IF EXISTS (SELECT 1 FROM Users WHERE username = @username)
        UPDATE Users SET passwordHash = @passwordHash, name = @name, role = @role, permissions = @permissions, updatedAt = SYSUTCDATETIME()
        WHERE username = @username
      ELSE
        INSERT INTO Users (username, passwordHash, name, role, permissions)
        VALUES (@username, @passwordHash, @name, @role, @permissions)
    `);
}

export async function findAll(): Promise<User[]> {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT id, username, name, role, isActive, permissions
    FROM Users
    ORDER BY name
  `);
  return result.recordset.map(mapUser);
}

export async function updateRoleAndPermissions(
  id: number,
  role: UserRole,
  permissions?: Permissions | null,
): Promise<boolean> {
  const pool = await getPool();
  const perms = permissions ?? getDefaultPermissions(role);
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .input('role', sql.NVarChar(20), role)
    .input('permissions', sql.NVarChar(sql.MAX), JSON.stringify(perms))
    .query(`
      UPDATE Users SET role = @role, permissions = @permissions, updatedAt = SYSUTCDATETIME()
      WHERE id = @id
    `);
  return result.rowsAffected[0] > 0;
}

export async function updateActive(id: number, isActive: boolean): Promise<boolean> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .input('isActive', sql.Bit, isActive ? 1 : 0)
    .query(`
      UPDATE Users SET isActive = @isActive, updatedAt = SYSUTCDATETIME()
      WHERE id = @id
    `);
  return result.rowsAffected[0] > 0;
}

export async function deleteUser(id: number): Promise<boolean> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query('DELETE FROM Users WHERE id = @id');
  return result.rowsAffected[0] > 0;
}

// Allowed emails for MSAL
export async function findAllowedEmails(): Promise<AllowedEmail[]> {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT id, email, role, isActive, permissions
    FROM AllowedEmails
    ORDER BY email
  `);
  return result.recordset.map((row) => ({
    id: row.id as number,
    email: row.email as string,
    role: row.role as UserRole,
    isActive: row.isActive as boolean,
    permissions: parsePermissions(row.permissions as string | undefined, row.role as UserRole),
  }));
}

export async function findAllowedEmailByEmail(email: string): Promise<AllowedEmail | null> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('email', sql.NVarChar(100), email)
    .query(`
      SELECT id, email, role, isActive, permissions
      FROM AllowedEmails WHERE email = @email
    `);
  const row = result.recordset[0];
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
  const exists = await pool
    .request()
    .input('email', sql.NVarChar(100), email)
    .query('SELECT TOP 1 1 AS existsEmail FROM AllowedEmails WHERE email = @email');

  if (exists.recordset.length > 0) return false;

  const perms = permissions ?? getDefaultPermissions(role);
  await pool
    .request()
    .input('email', sql.NVarChar(100), email)
    .input('role', sql.NVarChar(20), role)
    .input('permissions', sql.NVarChar(sql.MAX), JSON.stringify(perms))
    .query(`INSERT INTO AllowedEmails (email, role, permissions) VALUES (@email, @role, @permissions)`);
  return true;
}

export async function updateAllowedEmail(
  id: number,
  role: UserRole,
  isActive: boolean,
  permissions?: Permissions | null,
): Promise<boolean> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .input('role', sql.NVarChar(20), role)
    .input('isActive', sql.Bit, isActive ? 1 : 0);

  if (permissions) {
    result.input('permissions', sql.NVarChar(sql.MAX), JSON.stringify(permissions));
    const res = await result.query(`
      UPDATE AllowedEmails SET role = @role, isActive = @isActive, permissions = @permissions
      WHERE id = @id
    `);
    return res.rowsAffected[0] > 0;
  }

  const res = await result.query(`
    UPDATE AllowedEmails SET role = @role, isActive = @isActive
    WHERE id = @id
  `);
  return res.rowsAffected[0] > 0;
}

export async function deleteAllowedEmail(id: number): Promise<boolean> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query('DELETE FROM AllowedEmails WHERE id = @id');
  return result.rowsAffected[0] > 0;
}
