import { getPool } from '../config/db.js';

async function main() {
  const pool = await getPool();
  const r = await pool.request().query(`SELECT id, referenciaCMH, nombre FROM Recambios WHERE referenciaCMH LIKE '%3699%' OR nombre LIKE '%3699%'`);
  console.log('Found:', r.recordset.length);
  for (const d of r.recordset) console.log(JSON.stringify(d));
  await pool.close();
}
main().catch(console.error);
