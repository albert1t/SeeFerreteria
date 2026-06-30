import sql from 'mssql';
import { env } from './env.js';

const config: sql.config = {
  server: env.AZURE_SQL_SERVER,
  database: env.AZURE_SQL_DATABASE,
  user: env.AZURE_SQL_USER,
  password: env.AZURE_SQL_PASSWORD,
  options: {
    encrypt: env.AZURE_SQL_ENCRYPT,
    trustServerCertificate: env.AZURE_SQL_TRUST_SERVER_CERTIFICATE,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await new sql.ConnectionPool(config).connect();
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

export { sql };
