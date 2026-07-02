import { getPool } from '../config/db.js';

async function main() {
  const pool = await getPool();

  // Alter nReposicion to allow nulls
  await pool.request().query(`ALTER TABLE Recambios ALTER COLUMN nReposicion INT NULL`);
  console.log('nReposicion alterado a nullable');

  // Clear plazoEntrega
  const r1 = await pool.request().query(`UPDATE Recambios SET plazoEntrega = NULL`);
  console.log(`plazoEntrega → NULL: ${r1.rowsAffected[0]} filas`);

  // Clear nReposicion
  const r2 = await pool.request().query(`UPDATE Recambios SET nReposicion = NULL`);
  console.log(`nReposicion → NULL: ${r2.rowsAffected[0]} filas`);

  // Verify
  const sample = await pool.request().query(`SELECT TOP 5 id, referenciaCMH, plazoEntrega, nReposicion FROM Recambios ORDER BY id`);
  console.log('\nMuestra:');
  for (const d of sample.recordset) {
    console.log(`  ${d.id} ${d.referenciaCMH}: plazo="${d.plazoEntrega}" nRep=${d.nReposicion}`);
  }

  await pool.close();
}
main().catch(console.error);
