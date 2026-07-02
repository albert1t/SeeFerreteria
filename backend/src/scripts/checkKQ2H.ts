import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as xlsx from 'xlsx';
import { getPool } from '../config/db.js';

async function main() {
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

  // Find KQ2H in Excel
  for (const r of rows) {
    const ref = getVal(r, ['Referencia CMH', 'Ref CMH', 'Referencia', 'Ref', 'referenciacmh']);
    if (ref && String(ref).includes('KQ2H')) {
      console.log('Excel ref:', JSON.stringify(String(ref)));
      console.log('Col:', JSON.stringify(getVal(r, ['Col', 'Columna', 'C'])));
      console.log('Fila:', JSON.stringify(getVal(r, ['Row', 'Fila', 'F'])));
    }
  }

  // Find KQ2H in DB
  const pool = await getPool();
  const db = await pool.request()
    .query(`SELECT id, referenciaCMH, nombre FROM Recambios WHERE referenciaCMH LIKE '%KQ2H%'`);
  for (const d of db.recordset) {
    console.log('DB ref:', JSON.stringify(d.referenciaCMH), 'nombre:', JSON.stringify(d.nombre));
  }

  // Show all refs in A9
  console.log('\nAll refs in A9 Excel:');
  for (const r of rows) {
    const ref = getVal(r, ['Referencia CMH', 'Ref CMH', 'Referencia', 'Ref', 'referenciacmh']);
    if (ref) {
      console.log('  ', JSON.stringify(String(ref).trim()));
    }
  }

  await pool.close();
}

main().catch(console.error);
