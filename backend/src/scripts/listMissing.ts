import { getPool } from '../config/db.js';

async function main() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT id, cmhReference, customerReference, name, brand
    FROM Products
    WHERE image IS NULL OR image NOT LIKE '%ferreteriastorageacc%'
    ORDER BY id
  `);
  for (const r of result.recordset) {
    const refs = [r.cmhReference];
    if (r.customerReference) refs.push(r.customerReference);
    console.log(`${r.id} | ${r.cmhReference} | ${r.customerReference || ''} | ${r.name} | ${r.brand || ''}`);
  }
  console.log(`TOTAL: ${result.recordset.length}`);
  await pool.close();
}

main().catch(console.error);
