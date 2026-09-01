import { getPool } from '../config/db.js';
export async function getValue(key) {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT settingValue FROM Settings WHERE settingKey = ?', [key]);
    return rows[0]?.settingValue ?? null;
}
export async function setValue(key, value) {
    const pool = await getPool();
    await pool.query('INSERT INTO Settings (settingKey, settingValue, updatedAt) VALUES (?, ?, UTC_TIMESTAMP(6)) ON DUPLICATE KEY UPDATE settingValue = VALUES(settingValue), updatedAt = VALUES(updatedAt)', [key, value]);
}
export async function getAll() {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT settingKey, settingValue FROM Settings');
    const result = {};
    for (const row of rows) {
        result[row.settingKey] = row.settingValue;
    }
    return result;
}
