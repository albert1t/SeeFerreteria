import { getPool } from '../config/db.js';

async function main() {
  const pool = await getPool();

  // Alter reorderPoint to allow nulls
  await pool.request().query(`ALTER TABLE Products ALTER COLUMN reorderPoint INT NULL`);
  console.log('reorderPoint alterado a nullable');

  // Clear deliveryTime
  const r1 = await pool.request().query(`UPDATE Products SET deliveryTime = NULL`);
  console.log(`deliveryTime → NULL: ${r1.rowsAffected[0]} filas`);

  // Clear reorderPoint
  const r2 = await pool.request().query(`UPDATE Products SET reorderPoint = NULL`);
  console.log(`reorderPoint → NULL: ${r2.rowsAffected[0]} filas`);

  // Verify
  const sample = await pool.request().query(`SELECT TOP 5 id, cmhReference, deliveryTime, reorderPoint FROM Products ORDER BY id`);
  console.log('\nMuestra:');
  for (const d of sample.recordset) {
    console.log(`  ${d.id} ${d.cmhReference}: plazo="${d.deliveryTime}" nRep=${d.reorderPoint}`);
  }

  await pool.close();
}
main().catch(console.error);
