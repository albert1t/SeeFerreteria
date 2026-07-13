import { getPool } from '../config/db.js';
import type { FamiliaConSubs } from '../types/index.js';

export async function getFamilias(): Promise<FamiliaConSubs[]> {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT id, nombre, descripcion FROM Familias ORDER BY nombre');
  return (rows as any[]).map((f: any) => ({
    id: f.id as number,
    nombre: f.nombre as string,
    descripcion: f.descripcion as string | null,
  }));
}

export async function createFamilia(nombre: string, descripcion?: string | null): Promise<boolean> {
  const pool = await getPool();
  const [exists] = await pool.query('SELECT 1 AS existsUser FROM Familias WHERE nombre = ? LIMIT 1', [nombre]);
  if ((exists as any[]).length > 0) return false;

  await pool.query('INSERT INTO Familias (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion ?? null]);
  return true;
}

export async function updateFamilia(id: number, nombre: string, descripcion?: string | null): Promise<boolean> {
  const pool = await getPool();
  const [result] = await pool.query('UPDATE Familias SET nombre = ?, descripcion = ? WHERE id = ?', [nombre, descripcion ?? null, id]);
  return (result as any).affectedRows > 0;
}

export async function deleteFamilia(id: number): Promise<boolean> {
  const pool = await getPool();
  const [result] = await pool.query('DELETE FROM Familias WHERE id = ?', [id]);
  return (result as any).affectedRows > 0;
}
