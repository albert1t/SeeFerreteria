import { getPool } from '../config/db.js';

async function main() {
  const pool = await getPool();
  const r = await pool.request().query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Recambios' ORDER BY ORDINAL_POSITION`);
  for (const c of r.recordset) {
    console.log(`${c.COLUMN_NAME} (${c.DATA_TYPE})`);
  }
  await pool.close();
}
main().catch(console.error);
