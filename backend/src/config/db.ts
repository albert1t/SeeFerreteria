import mysql from 'mysql2/promise';
import { env } from './env.js';

const config: mysql.PoolOptions = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
};

let pool: mysql.Pool | null = null;

export async function getPool(): Promise<mysql.Pool> {
  if (!pool) {
    pool = mysql.createPool(config);
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function query(sql: string, params?: any[]) {
  const p = await getPool();
  const [rows] = await p.query(sql, params);
  return rows as any[];
}

export async function execute(sql: string, params?: any[]) {
  const p = await getPool();
  const [rows] = await p.execute(sql, params);
  return rows as any[];
}

// Backward compatibility for scripts that import `sql` (formerly mssql template tag)
export const sql = {
  NVarChar: (_n: number) => 'VARCHAR',
  NVarCharMax: 'VARCHAR(MAX)',
  Int: 'INT',
  VarChar: (_n: number) => 'VARCHAR',
  Bit: 'BIT',
  DateTime: 'DATETIME',
  DateTime2: (_n: number) => 'DATETIME2',
};
