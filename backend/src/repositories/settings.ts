import { getPool } from '../config/db.js';

export async function getValue(key: string): Promise<string | null> {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT settingValue FROM Settings WHERE settingKey = ?', [key]);
  return ((rows as any[])[0]?.settingValue as string | undefined) ?? null;
}

export async function setValue(key: string, value: string): Promise<void> {
  const pool = await getPool();
  await pool.query(
    'INSERT INTO Settings (settingKey, settingValue, updatedAt) VALUES (?, ?, UTC_TIMESTAMP(6)) ON DUPLICATE KEY UPDATE settingValue = VALUES(settingValue), updatedAt = VALUES(updatedAt)',
    [key, value]
  );
}

export async function getAll(): Promise<Record<string, string>> {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT settingKey, settingValue FROM Settings');
  const result: Record<string, string> = {};
  for (const row of rows as any[]) {
    result[row.settingKey] = row.settingValue;
  }
  return result;
}
