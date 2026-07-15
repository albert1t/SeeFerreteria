import mysql from 'mysql2/promise';
import { env } from './env.js';
const config = {
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
let pool = null;
export async function getPool() {
    if (!pool) {
        pool = mysql.createPool(config);
    }
    return pool;
}
export async function closePool() {
    if (pool) {
        await pool.end();
        pool = null;
    }
}
export async function query(sql, params) {
    const p = await getPool();
    const [rows] = await p.query(sql, params);
    return rows;
}
export async function execute(sql, params) {
    const p = await getPool();
    const [rows] = await p.execute(sql, params);
    return rows;
}
// Backward compatibility for scripts that import `sql` (formerly mssql template tag)
export const sql = {
    NVarChar: (_n) => 'VARCHAR',
    NVarCharMax: 'VARCHAR(MAX)',
    Int: 'INT',
    VarChar: (_n) => 'VARCHAR',
    Bit: 'BIT',
    DateTime: 'DATETIME',
    DateTime2: (_n) => 'DATETIME2',
};
