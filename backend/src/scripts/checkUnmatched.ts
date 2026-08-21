import { getPool } from '../config/db.js';

async function main() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT id, cmhReference, customerReference, name, image
    FROM Products
    WHERE image IS NULL OR image NOT LIKE '%ferreteriastorageacc%'
    ORDER BY id
  `);
  for (const r of result.recordset) {
    console.log(`${r.id} | ${r.cmhReference} | ${r.customerReference || ''} | ${r.name}`);
  }
  console.log(`Total unmatched: ${result.recordset.length}`);
  await pool.close();
}

main().catch(console.error);
