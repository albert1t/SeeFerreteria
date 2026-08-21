import { getPool, sql } from '../config/db.js';

async function main() {
  const pool = await getPool();
  await pool.request()
    .input('familyId', sql.Int, 10)
    .query(`UPDATE Products SET familyId = @familyId WHERE panel = 'A6' AND col = 1 AND [row] BETWEEN 1 AND 4`);
  console.log('Family actualizada a Neumatica (ID 10)');
  const r = await pool.request().query(`SELECT id, cmhReference, familyId FROM Products WHERE panel = 'A6' AND col = 1 AND [row] BETWEEN 1 AND 4 ORDER BY [row]`);
  for (const d of r.recordset) {
    console.log(`  ${d.id} ${d.cmhReference} → familyId=${d.familyId}`);
  }
  await pool.close();
}
main().catch(console.error);
