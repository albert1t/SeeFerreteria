import { getPool } from '../config/db.js';

async function main() {
  const pool = await getPool();
  const r = await pool.request().query('SELECT id, nombre FROM Familias ORDER BY id');
  console.log(JSON.stringify(r.recordset, null, 2));
  await pool.close();
}

main().catch(console.error);
