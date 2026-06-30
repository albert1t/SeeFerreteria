import { getPool } from '../config/db.js';
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
