import { getPool } from '../config/db.js';

async function main() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT id, referenciaCMH, referenciaCliente, nombre, marca
    FROM Recambios
    WHERE imagen IS NULL OR imagen NOT LIKE '%ferreteriastorageacc%'
    ORDER BY id
  `);
  for (const r of result.recordset) {
    const refs = [r.referenciaCMH];
    if (r.referenciaCliente) refs.push(r.referenciaCliente);
    console.log(`${r.id} | ${r.referenciaCMH} | ${r.referenciaCliente || ''} | ${r.nombre} | ${r.marca || ''}`);
  }
  console.log(`TOTAL: ${result.recordset.length}`);
  await pool.close();
}

main().catch(console.error);
