import { getPool, sql } from '../config/db.js';

async function main() {
  const pool = await getPool();
  const result = await pool.request()
    .query("SELECT COUNT(*) AS cnt FROM Recambios WHERE imagen IS NOT NULL");
  console.log('Total con imagen:', result.recordset[0].cnt);

  const sample = await pool.request()
    .query("SELECT TOP 5 id, referenciaCMH, LEFT(imagen,80) AS img FROM Recambios WHERE imagen IS NOT NULL");
  for (const r of sample.recordset) {
    console.log(`  #${r.id} ${r.referenciaCMH} -> ${r.img}`);
  }

  await pool.close();
}
main().catch(console.error);
