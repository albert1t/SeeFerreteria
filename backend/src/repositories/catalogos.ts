import { getPool, sql } from '../config/db.js';
import type { FamiliaConSubs } from '../types/index.js';

export async function getFamilias(): Promise<FamiliaConSubs[]> {
  const pool = await getPool();
  const familiasResult = await pool.request().query(`
    SELECT id, nombre, descripcion FROM Familias ORDER BY nombre
  `);

  return familiasResult.recordset.map((f) => ({
    id: f.id as number,
    nombre: f.nombre as string,
    descripcion: f.descripcion as string | null,
  }));
}

export async function createFamilia(nombre: string, descripcion?: string | null): Promise<boolean> {
  const pool = await getPool();
  const exists = await pool
    .request()
    .input('nombre', sql.NVarChar(100), nombre)
    .query('SELECT TOP 1 1 AS existsUser FROM Familias WHERE nombre = @nombre');
  if (exists.recordset.length > 0) return false;

  await pool
    .request()
    .input('nombre', sql.NVarChar(100), nombre)
    .input('descripcion', sql.NVarChar(500), descripcion ?? null)
    .query('INSERT INTO Familias (nombre, descripcion) VALUES (@nombre, @descripcion)');
  return true;
}

export async function updateFamilia(id: number, nombre: string, descripcion?: string | null): Promise<boolean> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .input('nombre', sql.NVarChar(100), nombre)
    .input('descripcion', sql.NVarChar(500), descripcion ?? null)
    .query('UPDATE Familias SET nombre = @nombre, descripcion = @descripcion WHERE id = @id');
  return result.rowsAffected[0] > 0;
}

export async function deleteFamilia(id: number): Promise<boolean> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query('DELETE FROM Familias WHERE id = @id');
  return result.rowsAffected[0] > 0;
}
