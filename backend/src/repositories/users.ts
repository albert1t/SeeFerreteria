import { getPool, sql } from '../config/db.js';
import type { User, UserWithHash, AllowedEmail, UserRole } from '../types/index.js';

function mapUser(record: Record<string, unknown>): User {
  return {
    id: record.id as number,
    username: record.username as string,
    name: record.name as string,
    role: record.role as UserRole,
    isActive: Boolean(record.isActive),
  };
}

export async function findByUsername(username: string): Promise<UserWithHash | null> {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, username, passwordHash, name, role, isActive FROM Users WHERE username = ? AND isActive = 1',
    [username]
  );
  const row = (rows as any[])[0];
  if (!row) return null;
  return { ...mapUser(row), passwordHash: row.passwordHash as string };
}

export async function findByUsernameAll(username: string): Promise<UserWithHash | null> {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, username, passwordHash, name, role, isActive FROM Users WHERE username = ?',
    [username]
  );
  const row = (rows as any[])[0];
  if (!row) return null;
  return { ...mapUser(row), passwordHash: row.passwordHash as string };
}

export async function findById(id: number): Promise<User | null> {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, username, name, role, isActive FROM Users WHERE id = ? AND isActive = 1',
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
  isActive = false,
): Promise<boolean> {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT 1 AS existsUser FROM Users WHERE username = ? LIMIT 1', [username]);
  if ((rows as any[]).length > 0) return false;

  await pool.query(
    'INSERT INTO Users (username, passwordHash, name, role, isActive) VALUES (?, ?, ?, ?, ?)',
    [username, passwordHash, name, role, isActive ? 1 : 0]
  );
  return true;
}

export async function upsertUser(
  username: string,
  passwordHash: string,
  name: string,
  role: UserRole,
): Promise<void> {
  const pool = await getPool();
  const [existing] = await pool.query('SELECT id FROM Users WHERE username = ?', [username]);
  if ((existing as any[]).length > 0) {
    await pool.query(
      'UPDATE Users SET passwordHash = ?, name = ?, role = ?, updatedAt = UTC_TIMESTAMP(6) WHERE username = ?',
      [passwordHash, name, role, username]
    );
  } else {
    await pool.query(
      'INSERT INTO Users (username, passwordHash, name, role) VALUES (?, ?, ?, ?)',
      [username, passwordHash, name, role]
    );
  }
}

export async function findAll(): Promise<User[]> {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, username, name, role, isActive FROM Users ORDER BY name'
  );
  return (rows as any[]).map(mapUser);
}

export async function updateRole(
  id: number,
  role: UserRole,
): Promise<boolean> {
  const pool = await getPool();
  const [result] = await pool.query(
    'UPDATE Users SET role = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?',
    [role, id]
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
    await connection.query('UPDATE Orders SET requesterId = ? WHERE requesterId = ?', [reassignToId, id]);
    await connection.query('DELETE FROM OrderStatusHistory WHERE userId = ?', [id]);
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

// Allowed emails para MSAL
export async function findAllowedEmails(): Promise<AllowedEmail[]> {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT id, email, role, isActive FROM AllowedEmails ORDER BY email');
  return (rows as any[]).map((row: any) => ({
    id: row.id as number,
    email: row.email as string,
    role: row.role as UserRole,
    isActive: Boolean(row.isActive),
  }));
}

export async function findAllowedEmailByEmail(email: string): Promise<AllowedEmail | null> {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT id, email, role, isActive FROM AllowedEmails WHERE email = ?',
    [email]
  );
  const row = (rows as any[])[0];
  if (!row) return null;
  return {
    id: row.id as number,
    email: row.email as string,
    role: row.role as UserRole,
    isActive: Boolean(row.isActive),
  };
}

export async function createAllowedEmail(
  email: string,
  role: UserRole = 'user',
): Promise<boolean> {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT 1 AS existsEmail FROM AllowedEmails WHERE email = ? LIMIT 1', [email]);
  if ((rows as any[]).length > 0) return false;

  await pool.query(
    'INSERT INTO AllowedEmails (email, role) VALUES (?, ?)',
    [email, role]
  );
  return true;
}

export async function updateAllowedEmail(
  id: number,
  role: UserRole,
  isActive: boolean,
): Promise<boolean> {
  const pool = await getPool();
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
