import { readFileSync } from 'fs';
import { resolve } from 'path';
import xlsx from 'xlsx';
import { getPool, sql, closePool } from '../config/db.js';

interface ExcelRow {
  ref: string;
  metric: string | null;
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

      const metric = getVal(row, ['Metrica', 'Métrica', 'Dimensiones', 'Medida']);
      allRefs.push({ ref, metric, sheet: sheetName });
    }
  }

  console.log(`Total referencias en Excel: ${allRefs.length}`);
  console.log(`Con métrica: ${allRefs.filter(r => r.metric).length}`);
  console.log(`Sin métrica: ${allRefs.filter(r => !r.metric).length}`);

  // Get all products from DB
  const dbResult = await pool.request().query(`
    SELECT id, cmhReference, metric FROM Products
  `);
  const dbMap = new Map<string, { id: number; metric: string | null }>();
  for (const row of dbResult.recordset) {
    dbMap.set(row.cmhReference as string, { id: row.id, metric: row.metric });
  }

  console.log(`\nTotal products en BD: ${dbMap.size}`);

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

    if (dbRecambio.metric && dbRecambio.metric.trim() !== '') {
      alreadyHas++;
      continue;
    }

    if (!excelRow.metric) {
      noMetrica++;
      continue;
    }

    // Update the metric
    await pool.request()
      .input('id', sql.Int, dbRecambio.id)
      .input('metric', sql.NVarChar(100), excelRow.metric)
      .query('UPDATE Products SET metric = @metric, updatedAt = SYSUTCDATETIME() WHERE id = @id');

    updated++;
    console.log(`  [${dbRecambio.id}] ${excelRow.ref} → métrica: "${excelRow.metric}" (hoja ${excelRow.sheet})`);
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
