import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as xlsx from 'xlsx';
import { getPool, sql } from '../config/db.js';

async function main() {
  // 1. Leer Excel
  const buf = readFileSync(resolve('../Lista materiales (2).xlsx'));
  const workbook = xlsx.read(buf);
  const excelRows: { ref: string; panel: string; col: number; row: number }[] = [];

  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });

    for (const row of rows) {
      const getVal = (keys: string[]) => {
        for (const key of keys) {
          const match = Object.keys(row).find(k => k.trim().toLowerCase() === key.toLowerCase());
          if (match && row[match] !== '') return row[match];
        }
        return undefined;
      };

      const ref = getVal(['Referencia CMH', 'Ref CMH', 'Referencia', 'Ref', 'referenciacmh']);
      if (!ref) continue;

      const col = parseInt(getVal(['Col', 'Columna', 'C']) ?? '1', 10);
      const rowNum = parseInt(getVal(['Row', 'Fila', 'F']) ?? '1', 10);

      excelRows.push({
        ref: String(ref).trim(),
        panel: sheetName.trim(),
        col: isNaN(col) ? 1 : col,
        row: isNaN(rowNum) ? 1 : rowNum,
      });
    }
  }

  console.log(`Excel: ${excelRows.length} recambios`);

  // 2. Leer DB
  const pool = await getPool();
  const dbResult = await pool.request().query(`
    SELECT id, referenciaCMH, panel, col, [row] FROM Recambios ORDER BY id
  `);
  const dbRows = dbResult.recordset;
  console.log(`DB: ${dbRows.length} recambios`);

  // 3. Comparar
  const excelMap = new Map<string, { panel: string; col: number; row: number }>();
  for (const e of excelRows) {
    excelMap.set(e.ref, { panel: e.panel, col: e.col, row: e.row });
  }

  let fixed = 0;
  let errors = 0;

  for (const db of dbRows) {
    const ref = (db.referenciaCMH as string).trim();
    const expected = excelMap.get(ref);
    if (!expected) continue; // no está en excel

    const dbPanel = (db.panel as string).trim();
    const dbCol = db.col as number;
    const dbRow = db.row as number;

    if (dbPanel !== expected.panel || dbCol !== expected.col || dbRow !== expected.row) {
      console.log(`  ${ref}: DB=${dbPanel} C${dbCol}F${dbRow} → Excel=${expected.panel} C${expected.col}F${expected.row}`);
      try {
        // Verificar si la posición destino está ocupada
        const ocupado = await pool.request()
          .input('panel', sql.NVarChar(10), expected.panel)
          .input('col', sql.TinyInt, expected.col)
          .input('row', sql.TinyInt, expected.row)
          .input('excludeId', sql.Int, db.id)
          .query(`SELECT id, referenciaCMH FROM Recambios WHERE panel = @panel AND col = @col AND [row] = @row AND id != @excludeId`);

        if (ocupado.recordset.length > 0) {
          const ocupante = ocupado.recordset[0];
          console.log(`    ⚠ Posición ocupada por ${ocupante.referenciaCMH} (ID ${ocupante.id}), se intercambian`);
          // Intercambiar posiciones entre db y ocupante (swap)
          const transaction = pool.transaction();
          await transaction.begin();
          try {
            await transaction.request()
              .input('id1', sql.Int, db.id)
              .input('tmpRow', sql.TinyInt, (db.id as number) % 15 + 1)
              .query(`UPDATE Recambios SET panel = 'ZZ', col = 1, [row] = @tmpRow, updatedAt = SYSUTCDATETIME() WHERE id = @id1`);

            await transaction.request()
              .input('id2', sql.Int, ocupante.id)
              .input('p1', sql.NVarChar(10), db.panel)
              .input('c1', sql.TinyInt, db.col)
              .input('r1b', sql.TinyInt, db.row)
              .query(`UPDATE Recambios SET panel = @p1, col = @c1, [row] = @r1b, updatedAt = SYSUTCDATETIME() WHERE id = @id2`);

            await transaction.request()
              .input('id1', sql.Int, db.id)
              .input('p2', sql.NVarChar(10), expected.panel)
              .input('c2', sql.TinyInt, expected.col)
              .input('r2b', sql.TinyInt, expected.row)
              .query(`UPDATE Recambios SET panel = @p2, col = @c2, [row] = @r2b, updatedAt = SYSUTCDATETIME() WHERE id = @id1`);

            await transaction.commit();
            console.log(`    ✅ Intercambiados`);
            fixed++;
          } catch (err2: any) {
            await transaction.rollback();
            console.log(`    ❌ Error en intercambio: ${err2.message}`);
            errors++;
          }
          continue;
        }

        await pool.request()
          .input('id', sql.Int, db.id)
          .input('panel', sql.NVarChar(10), expected.panel)
          .input('col', sql.TinyInt, expected.col)
          .input('row', sql.TinyInt, expected.row)
          .query(`UPDATE Recambios SET panel = @panel, col = @col, [row] = @row, updatedAt = SYSUTCDATETIME() WHERE id = @id`);
        console.log(`    ✅ Corregido`);
        fixed++;
      } catch (err: any) {
        console.log(`    ❌ Error: ${err.message}`);
        errors++;
      }
    }
  }

  console.log(`\nResumen: ${fixed} corregidos, ${errors} errores, ${excelRows.length - fixed - errors} ya correctos`);
  await pool.close();
}

main().catch(console.error);
