import { getPool, sql } from '../config/db.js';
import type { User, UserWithHash } from '../types/index.js';

function mapUser(record: Record<string, unknown>): User {
  return {
    id: record.id as number,
    username: record.username as string,
    name: record.name as string,
    role: record.role as User['role'],
    isActive: record.isActive as boolean,
  };
}

export async function findByUsername(username: string): Promise<UserWithHash | null> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('username', sql.NVarChar(50), username)
    .query(`
      SELECT id, username, passwordHash, name, role, isActive
      FROM Users WHERE username = @username AND isActive = 1
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
      SELECT id, username, name, role, isActive
      FROM Users WHERE id = @id AND isActive = 1
    `);
  const row = result.recordset[0];
  return row ? mapUser(row) : null;
}

export async function createUser(
  username: string,
  passwordHash: string,
  name: string,
  role: User['role'],
): Promise<boolean> {
  const pool = await getPool();
  const exists = await pool
    .request()
    .input('username', sql.NVarChar(50), username)
    .query('SELECT TOP 1 1 AS existsUser FROM Users WHERE username = @username');

  if (exists.recordset.length > 0) {
    return false;
  }

  await pool
    .request()
    .input('username', sql.NVarChar(50), username)
    .input('passwordHash', sql.NVarChar(255), passwordHash)
    .input('name', sql.NVarChar(100), name)
    .input('role', sql.NVarChar(20), role)
    .query(`INSERT INTO Users (username, passwordHash, name, role) VALUES (@username, @passwordHash, @name, @role)`);

  return true;
}

export async function upsertUser(
  username: string,
  passwordHash: string,
  name: string,
  role: User['role'],
): Promise<void> {
  const pool = await getPool();
  await pool
    .request()
    .input('username', sql.NVarChar(50), username)
    .input('passwordHash', sql.NVarChar(255), passwordHash)
    .input('name', sql.NVarChar(100), name)
    .input('role', sql.NVarChar(20), role)
    .query(`
      IF EXISTS (SELECT 1 FROM Users WHERE username = @username)
        UPDATE Users SET passwordHash = @passwordHash, name = @name, role = @role, updatedAt = SYSUTCDATETIME()
        WHERE username = @username
      ELSE
        INSERT INTO Users (username, passwordHash, name, role)
        VALUES (@username, @passwordHash, @name, @role)
    `);
}
