import { getPool } from '../config/db.js';
import type { FamilyWithSubs } from '../types/index.js';

export async function getFamilies(): Promise<FamilyWithSubs[]> {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT id, name, description FROM Families ORDER BY name');
  return (rows as any[]).map((f: any) => ({
    id: f.id as number,
    name: f.name as string,
    description: f.description as string | null,
  }));
}

export async function createFamilia(name: string, description?: string | null): Promise<boolean> {
  const pool = await getPool();
  const [exists] = await pool.query('SELECT 1 AS existsUser FROM Families WHERE name = ? LIMIT 1', [name]);
  if ((exists as any[]).length > 0) return false;

  await pool.query('INSERT INTO Families (name, description) VALUES (?, ?)', [name, description ?? null]);
  return true;
}

export async function updateFamilia(id: number, name: string, description?: string | null): Promise<boolean> {
  const pool = await getPool();
  const [result] = await pool.query('UPDATE Families SET name = ?, description = ? WHERE id = ?', [name, description ?? null, id]);
  return (result as any).affectedRows > 0;
}

export async function deleteFamilia(id: number): Promise<boolean> {
  const pool = await getPool();
  const [result] = await pool.query('DELETE FROM Families WHERE id = ?', [id]);
  return (result as any).affectedRows > 0;
}
