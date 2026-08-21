import { getPool, sql } from '../config/db.js';

async function main() {
  const pool = await getPool();
  const result = await pool.request()
    .query("SELECT COUNT(*) AS cnt FROM Products WHERE image IS NOT NULL");
  console.log('Total con image:', result.recordset[0].cnt);

  const sample = await pool.request()
    .query("SELECT TOP 5 id, cmhReference, LEFT(image,80) AS img FROM Products WHERE image IS NOT NULL");
  for (const r of sample.recordset) {
    console.log(`  #${r.id} ${r.cmhReference} -> ${r.img}`);
  }

  await pool.close();
}
main().catch(console.error);
