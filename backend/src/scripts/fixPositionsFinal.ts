import { getPool, sql } from '../config/db.js';

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const pool = await getPool();

  const moves: { ref: string; fromPanel: string; fromCol: number; fromRow: number; toPanel: string; toCol: number; toRow: number }[] = [
    { ref: 'QS-1/4-10-I', fromPanel: 'A6', fromCol: 2, fromRow: 9, toPanel: 'A6', toCol: 2, toRow: 6 },
    { ref: 'VRPA-CM-Q4-E', fromPanel: 'A8', fromCol: 1, fromRow: 8, toPanel: 'A8', toCol: 1, toRow: 5 },
    // GRLA-1/4-QS-8-D: from A8 C2F9 to A7 C4F7 (different panel)
    { ref: 'GRLA-1/4-QS-8-D', fromPanel: 'A8', fromCol: 2, fromRow: 9, toPanel: 'A7', toCol: 4, toRow: 7 },
    // QS-G1/8-6: from A8 C4F6 to A6 C2F3 (different panel)
    { ref: 'QS-G1/8-6', fromPanel: 'A8', fromCol: 4, fromRow: 6, toPanel: 'A6', toCol: 2, toRow: 3 },
    { ref: 'MS6-MV1', fromPanel: 'A9', fromCol: 2, fromRow: 10, toPanel: 'A9', toCol: 4, toRow: 8 },
    // NPFC-DS-M5-M5-M: from A9 C3F5 to A8 C5F6 (different panel)
    { ref: 'NPFC-DS-M5-M5-M', fromPanel: 'A9', fromCol: 3, fromRow: 5, toPanel: 'A8', toCol: 5, toRow: 6 },
  ];

  let fixed = 0;
  let errors = 0;

  for (const m of moves) {
    console.log(`\n${m.ref}: ${m.fromPanel} C${m.fromCol}F${m.fromRow} → ${m.toPanel} C${m.toCol}F${m.toRow}`);

    // Find the DB record by ref
    const rec = await pool.request()
      .input('ref', m.ref)
      .query(`SELECT id, panel, col, [row] FROM Recambios WHERE referenciaCMH = @ref`);
    if (rec.recordset.length === 0) {
      console.log(`  ❌ No encontrado en DB`);
      errors++;
      continue;
    }
    const db = rec.recordset[0];

    // Check if target is occupied
    const ocupado = await pool.request()
      .input('panel', m.toPanel)
      .input('col', sql.TinyInt, m.toCol)
      .input('row', sql.TinyInt, m.toRow)
      .input('excludeId', sql.Int, db.id)
      .query(`SELECT id, referenciaCMH, panel, col, [row] FROM Recambios WHERE panel = @panel AND col = @col AND [row] = @row AND id != @excludeId`);

    if (ocupado.recordset.length > 0) {
      const occ = ocupado.recordset[0];
      console.log(`  ⚠ Ocupado por ${occ.referenciaCMH} en ${occ.panel} C${occ.col}F${occ.row} → intercambiando`);
      // Swap: db → ZZ, occ → db's old pos, db → target
      const transaction = pool.transaction();
      await transaction.begin();
      try {
        const tmpRow = (db.id as number) % 15 + 1;
        await transaction.request()
          .input('id1', sql.Int, db.id)
          .input('tmpRow', sql.TinyInt, tmpRow)
          .query(`UPDATE Recambios SET panel = 'ZZ', col = 1, [row] = @tmpRow, updatedAt = SYSUTCDATETIME() WHERE id = @id1`);
        await transaction.request()
          .input('id2', sql.Int, occ.id)
          .input('p1', sql.NVarChar(10), m.fromPanel)
          .input('c1', sql.TinyInt, m.fromCol)
          .input('r1', sql.TinyInt, m.fromRow)
          .query(`UPDATE Recambios SET panel = @p1, col = @c1, [row] = @r1, updatedAt = SYSUTCDATETIME() WHERE id = @id2`);
        await transaction.request()
          .input('id1', sql.Int, db.id)
          .input('p2', sql.NVarChar(10), m.toPanel)
          .input('c2', sql.TinyInt, m.toCol)
          .input('r2', sql.TinyInt, m.toRow)
          .query(`UPDATE Recambios SET panel = @p2, col = @c2, [row] = @r2, updatedAt = SYSUTCDATETIME() WHERE id = @id1`);
        await transaction.commit();
        console.log(`  ✅ Intercambiados`);
        fixed++;
      } catch (err: any) {
        await transaction.rollback();
        console.log(`  ❌ Error: ${err.message}`);
        errors++;
      }
    } else {
      // Direct move
      try {
        await pool.request()
          .input('id', sql.Int, db.id)
          .input('panel', sql.NVarChar(10), m.toPanel)
          .input('col', sql.TinyInt, m.toCol)
          .input('row', sql.TinyInt, m.toRow)
          .query(`UPDATE Recambios SET panel = @panel, col = @col, [row] = @row, updatedAt = SYSUTCDATETIME() WHERE id = @id`);
        console.log(`  ✅ Movido`);
        fixed++;
      } catch (err: any) {
        console.log(`  ❌ Error: ${err.message}`);
        errors++;
      }
    }
    await sleep(300);
  }

  console.log(`\nResumen: ${fixed} movidos, ${errors} errores`);
  await pool.close();
}

main().catch(console.error);
