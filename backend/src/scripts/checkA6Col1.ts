import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as xlsx from 'xlsx';
import { getPool } from '../config/db.js';

async function main() {
  // Excel A6
  const buf = readFileSync(resolve('../Lista materiales (2).xlsx'));
  const workbook = xlsx.read(buf);
  const ws = workbook.Sheets['A6'];
  const rows = xlsx.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
  const getVal = (row: Record<string, any>, keys: string[]) => {
    for (const key of keys) {
      const match = Object.keys(row).find(k => k.trim().toLowerCase() === key.toLowerCase());
      if (match && row[match] !== '') return row[match];
    }
    return undefined;
  };

  console.log('=== A6 COLUMNA 1 EN EXCEL ===');
  for (const r of rows) {
    const ref = getVal(r, ['Referencia CMH', 'Ref CMH', 'Referencia', 'Ref', 'referenciacmh']);
    const col = parseInt(getVal(r, ['Col', 'Columna', 'C']) ?? '0', 10);
    if (col === 1) {
      const rown = parseInt(getVal(r, ['Row', 'Fila', 'F']) ?? '0', 10);
      const nom = getVal(r, ['Nombre', 'nombre']) || '';
      const marca = getVal(r, ['Marca', 'marca']) || '';
      const desc = getVal(r, ['Descripcion', 'descripcion', 'Description']) || '';
      const metrica = getVal(r, ['Metrica', 'metrica']) || '';
      const ue = getVal(r, ['Unidad de embalaje', 'unidad de embalaje']) || '';
      const pe = getVal(r, ['Plazo de entrega', 'plazo de entrega']) || '';
      const fam = getVal(r, ['Familia', 'familia']) || '';
      const nrep = getVal(r, ['Numero de reposicion - default']) || '';
      console.log(`  F${rown}: ref="${ref}" nombre="${nom}" marca="${marca}" desc="${desc}" metrica="${metrica}" ue="${ue}" plazo="${pe}" familia="${fam}" nrep="${nrep}"`);
    }
  }

  // DB A6 Col1
  const pool = await getPool();
  const db = await pool.request().query(`SELECT id, referenciaCMH, nombre, col, [row] FROM Recambios WHERE panel = 'A6' AND col = 1 ORDER BY [row]`);
  console.log(`\n=== A6 COLUMNA 1 EN DB (${db.recordset.length} recambios) ===`);
  for (const d of db.recordset) {
    console.log(`  F${d.row}: id=${d.id} ref="${d.referenciaCMH}" nombre="${d.nombre}"`);
  }

  await pool.close();
}
main().catch(console.error);
