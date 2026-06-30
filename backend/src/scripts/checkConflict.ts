import { getPool } from '../config/db.js';

async function main() {
  const pool = await getPool();

  // Check all positions in A8 and A9
  for (const panel of ['A8', 'A9']) {
    const r = await pool.request()
      .input('panel', panel)
      .query("SELECT col, [row], referenciaCMH FROM Recambios WHERE panel = @panel ORDER BY col, [row]");
    console.log(`\n${panel}:`);
    for (const row of r.recordset) {
      console.log(`  col=${row.col} row=${row.row} => ${row.referenciaCMH}`);
    }
  }

  await pool.close();
}
main().catch(console.error);
