import { getPool } from '../config/db.js';

async function main() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT id, referenciaCMH, referenciaCliente, nombre, imagen
    FROM Recambios
    WHERE imagen IS NULL OR imagen NOT LIKE '%ferreteriastorageacc%'
    ORDER BY id
  `);
  for (const r of result.recordset) {
    console.log(`${r.id} | ${r.referenciaCMH} | ${r.referenciaCliente || ''} | ${r.nombre}`);
  }
  console.log(`Total unmatched: ${result.recordset.length}`);
  await pool.close();
}

main().catch(console.error);
