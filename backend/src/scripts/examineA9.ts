import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as xlsx from 'xlsx';
import { getPool } from '../config/db.js';

async function main() {
  // Excel A9
  const buf = readFileSync(resolve('../Lista materiales (2).xlsx'));
  const workbook = xlsx.read(buf);
  const ws = workbook.Sheets['A9'];
  const rows = xlsx.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });

  const getVal = (row: Record<string, any>, keys: string[]) => {
    for (const key of keys) {
      const match = Object.keys(row).find(k => k.trim().toLowerCase() === key.toLowerCase());
      if (match && row[match] !== '') return row[match];
    }
    return undefined;
  };

  const excelRefs = new Map<string, { col: number; row: number }>();
  for (const r of rows) {
    const ref = getVal(r, ['Referencia CMH', 'Ref CMH', 'Referencia', 'Ref', 'referenciacmh']);
    if (!ref) continue;
    const col = parseInt(getVal(r, ['Col', 'Columna', 'C']) ?? '1', 10);
    const rown = parseInt(getVal(r, ['Row', 'Fila', 'F']) ?? '1', 10);
    excelRefs.set(String(ref).trim(), { col, row: rown });
  }
  console.log(`Excel A9: ${excelRefs.size} recambios`);

  // DB A9
  const pool = await getPool();
  const dbResult = await pool.request()
    .input('panel', 'A9')
    .query(`SELECT id, referenciaCMH, nombre, col, [row] FROM Recambios WHERE panel = 'A9' ORDER BY col, [row]`);
  const dbRows = dbResult.recordset;
  console.log(`DB A9: ${dbRows.length} recambios`);

  // Compare
  console.log('\n--- DB recambios en A9 ---');
  for (const d of dbRows) {
    const ref = (d.referenciaCMH as string).trim();
    const expected = excelRefs.get(ref);
    const pos = expected ? `C${expected.col}F${expected.row}` : 'NO EXCEL';
    console.log(`  DB: C${d.col}F${d.row}  ${ref} (${(d.nombre as string).substring(0, 30)}) → Excel: ${pos}`);
  }

  // Refs in Excel but not in DB A9
  console.log('\n--- Recambios en Excel A9 pero NO en DB panel A9 ---');
  for (const [ref, pos] of excelRefs) {
    const inDb = dbRows.find(d => (d.referenciaCMH as string).trim() === ref);
    if (!inDb) {
      // Check in other panels
      const other = await pool.request()
        .input('ref', ref)
        .query(`SELECT id, panel, col, [row] FROM Recambios WHERE referenciaCMH = @ref`);
      if (other.recordset.length > 0) {
        const o = other.recordset[0];
        console.log(`  ${ref} está en ${o.panel} C${o.col}F${o.row} (debe ir a A9 C${pos.col}F${pos.row})`);
      } else {
        console.log(`  ${ref} NO EXISTE en DB (debe ir a A9 C${pos.col}F${pos.row})`);
      }
    }
  }

  await pool.close();
}

main().catch(console.error);
