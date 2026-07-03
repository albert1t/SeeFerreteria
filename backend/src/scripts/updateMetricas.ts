import { readFileSync } from 'fs';
import { resolve } from 'path';
import xlsx from 'xlsx';
import { getPool, sql, closePool } from '../config/db.js';

interface ExcelRow {
  ref: string;
  metrica: string | null;
  sheet: string;
}

function getVal(row: Record<string, any>, keys: string[]): string | null {
  for (const key of keys) {
    const match = Object.keys(row).find(k => k.trim().toLowerCase() === key.toLowerCase());
    if (match && row[match] !== undefined && row[match] !== null && String(row[match]).trim() !== '') {
      return String(row[match]).trim();
    }
  }
  return null;
}

async function main() {
  const pool = await getPool();
  const excelPath = resolve(process.cwd(), '../Lista materiales (2).xlsx');
  console.log(`Leyendo Excel: ${excelPath}`);

  const workbook = xlsx.read(readFileSync(excelPath), { type: 'buffer' });
  const allRefs: ExcelRow[] = [];

  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json<Record<string, any>>(ws);

    for (const row of rows) {
      const ref = getVal(row, ['Referencia CMH', 'Ref CMH', 'Referencia', 'Ref', 'referenciacmh']);
      if (!ref) continue;

      const metrica = getVal(row, ['Metrica', 'Métrica', 'Dimensiones', 'Medida']);
      allRefs.push({ ref, metrica, sheet: sheetName });
    }
  }

  console.log(`Total referencias en Excel: ${allRefs.length}`);
  console.log(`Con métrica: ${allRefs.filter(r => r.metrica).length}`);
  console.log(`Sin métrica: ${allRefs.filter(r => !r.metrica).length}`);

  // Get all recambios from DB
  const dbResult = await pool.request().query(`
    SELECT id, referenciaCMH, metrica FROM Recambios
  `);
  const dbMap = new Map<string, { id: number; metrica: string | null }>();
  for (const row of dbResult.recordset) {
    dbMap.set(row.referenciaCMH as string, { id: row.id, metrica: row.metrica });
  }

  console.log(`\nTotal recambios en BD: ${dbMap.size}`);

  // Compare and update
  let updated = 0;
  let noExcel = 0;
  let noMetrica = 0;
  let alreadyHas = 0;
  let notInDB = 0;

  for (const excelRow of allRefs) {
    const dbRecambio = dbMap.get(excelRow.ref);

    if (!dbRecambio) {
      notInDB++;
      continue;
    }

    if (dbRecambio.metrica && dbRecambio.metrica.trim() !== '') {
      alreadyHas++;
      continue;
    }

    if (!excelRow.metrica) {
      noMetrica++;
      continue;
    }

    // Update the metrica
    await pool.request()
      .input('id', sql.Int, dbRecambio.id)
      .input('metrica', sql.NVarChar(100), excelRow.metrica)
      .query('UPDATE Recambios SET metrica = @metrica, updatedAt = SYSUTCDATETIME() WHERE id = @id');

    updated++;
    console.log(`  [${dbRecambio.id}] ${excelRow.ref} → métrica: "${excelRow.metrica}" (hoja ${excelRow.sheet})`);
  }

  console.log(`\n--- Resumen ---`);
  console.log(`Referencias en Excel: ${allRefs.length}`);
  console.log(`Actualizadas con métrica: ${updated}`);
  console.log(`Ya tenían métrica: ${alreadyHas}`);
  console.log(`Sin métrica en Excel: ${noMetrica}`);
  console.log(`Referencia no encontrada en BD: ${notInDB}`);

  await closePool();
  console.log('\nHecho.');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
