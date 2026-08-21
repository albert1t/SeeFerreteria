import { getPool } from '../config/db.js';

async function main() {
  const pool = await getPool();

  const result = await pool.request()
    .query("SELECT id, name, cmhReference, col, [row], panel, image FROM Products WHERE panel = 'A6' ORDER BY col, [row]");
  console.log(JSON.stringify(result.recordset, null, 2));

  await pool.close();
}

main().catch(console.error);
