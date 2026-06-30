import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as xlsx from 'xlsx';
import { getPool, closePool, sql } from '../config/db.js';

function findKey(row: Record<string, any>, keys: string[]): string | undefined {
  for (const key of keys) {
    const match = Object.keys(row).find(k => k.trim().toLowerCase() === key.toLowerCase());
    if (match) return String(row[match]);
  }
  return undefined;
}

async function compare() {
  console.log('=== Comparación: Excel vs Base de Datos (Recambios) ===\n');

  // 1. Leer Excel
  const excelPath = resolve(process.cwd(), '../Lista materiales.xlsx');
  const buffer = readFileSync(excelPath);
  const workbook = xlsx.read(buffer, { type: 'buffer' });

  const excelRefs: { referencia: string; hoja: string; filaIndex: number }[] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json<Record<string, any>>(worksheet);
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const ref = findKey(row, ['Referencia CMH', 'Ref CMH', 'Referencia', 'Ref', 'referenciacmh']);
      if (ref) {
        excelRefs.push({ referencia: ref.trim(), hoja: sheetName, filaIndex: i + 2 });
      }
    }
  }

  // 2. Leer DB
  await getPool();
  const pool = await getPool();
  const dbResult = await pool.request().query(`
    SELECT id, referenciaCMH, panel, col, row, nombre, marca, oculto
    FROM Recambios
    ORDER BY referenciaCMH
  `);

  const dbRefs = dbResult.recordset.map((r: any) => ({
    id: r.id,
    referenciaCMH: String(r.referenciaCMH).trim(),
    panel: r.panel,
    col: r.col,
    row: r.row,
    nombre: r.nombre,
    marca: r.marca,
    oculto: r.oculto,
  }));

  const dbRefMap = new Map(dbRefs.map(r => [r.referenciaCMH, r]));
  const excelRefSet = new Set(excelRefs.map(r => r.referencia));

  // 3. Comparar
  const enExcelNoDB = excelRefs.filter(r => !dbRefMap.has(r.referencia));
  const enDBNoExcel = dbRefs.filter(r => !excelRefSet.has(r.referenciaCMH));

  // 4. Reportar
  console.log(`Total en Excel:      ${excelRefs.length}`);
  console.log(`Total en DB:         ${dbRefs.length}`);
  console.log(`\n--- En Excel pero NO en DB: ${enExcelNoDB.length} ---`);
  if (enExcelNoDB.length > 0) {
    for (const r of enExcelNoDB) {
      console.log(`  [${r.hoja}:fila ${r.filaIndex}] ${r.referencia}`);
    }
  } else {
    console.log('  (ninguno)');
  }

  console.log(`\n--- En DB pero NO en Excel: ${enDBNoExcel.length} ---`);
  if (enDBNoExcel.length > 0) {
    for (const r of enDBNoExcel) {
      const oculto = r.oculto ? ' [oculto]' : '';
      console.log(`  ID=${r.id} | ${r.referenciaCMH} | panel=${r.panel} C${r.col}F${r.row}${oculto}`);
    }
  } else {
    console.log('  (ninguno)');
  }

  console.log('\n=== Fin de la comparación ===');

  await closePool();
}

compare().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
