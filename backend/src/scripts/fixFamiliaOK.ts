import { getPool, sql } from '../config/db.js';

async function main() {
  const pool = await getPool();
  await pool.request()
    .input('familiaId', sql.Int, 10)
    .query(`UPDATE Recambios SET familiaId = @familiaId WHERE panel = 'A6' AND col = 1 AND [row] BETWEEN 1 AND 4`);
  console.log('Familia actualizada a Neumatica (ID 10)');
  const r = await pool.request().query(`SELECT id, referenciaCMH, familiaId FROM Recambios WHERE panel = 'A6' AND col = 1 AND [row] BETWEEN 1 AND 4 ORDER BY [row]`);
  for (const d of r.recordset) {
    console.log(`  ${d.id} ${d.referenciaCMH} → familiaId=${d.familiaId}`);
  }
  await pool.close();
}
main().catch(console.error);
