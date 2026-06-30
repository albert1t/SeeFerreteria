import { getPool } from '../config/db.js';

async function main() {
  const pool = await getPool();

  const total = await pool.request().query('SELECT COUNT(*) AS cnt FROM Recambios');
  const withAzure = await pool.request().query("SELECT COUNT(*) AS cnt FROM Recambios WHERE imagen LIKE '%ferreteriastorageacc%'");
  const withPlaceholder = await pool.request().query("SELECT COUNT(*) AS cnt FROM Recambios WHERE imagen LIKE '%placehold.co%'");
  const noImage = await pool.request().query("SELECT COUNT(*) AS cnt FROM Recambios WHERE imagen IS NULL OR imagen = ''");

  console.log('========== FINAL STATUS ==========');
  console.log(`Total recambios:     ${total.recordset[0].cnt}`);
  console.log(`With Azure image:    ${withAzure.recordset[0].cnt}`);
  console.log(`With placeholder:    ${withPlaceholder.recordset[0].cnt}`);
  console.log(`No image:            ${noImage.recordset[0].cnt}`);
  console.log('==================================');

  if (withPlaceholder.recordset[0].cnt > 0 || noImage.recordset[0].cnt > 0) {
    console.log('\nRecambios still without Azure images:');
    const missing = await pool.request().query(`
      SELECT id, referenciaCMH, LEFT(imagen, 60) AS img
      FROM Recambios
      WHERE imagen IS NULL OR imagen = '' OR imagen NOT LIKE '%ferreteriastorageacc%'
      ORDER BY id
    `);
    for (const r of missing.recordset) {
      console.log(`  ${r.id} | ${r.referenciaCMH} | ${r.img || 'NULL'}`);
    }
  }

  await pool.close();
}

main().catch(console.error);
