import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as xlsx from 'xlsx';
import { getPool } from '../config/db.js';

async function main() {
  // 1. Read Excel
  const buf = readFileSync(resolve('../Lista materiales (2).xlsx'));
  const workbook = xlsx.read(buf);
  const excelRows: { ref: string; panel: string; col: number; row: number }[] = [];
  const seenPos = new Map<string, string[]>();

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
      const rown = parseInt(getVal(['Row', 'Fila', 'F']) ?? '1', 10);
      const key = `${sheetName}_C${col}F${rown}`;
      if (!seenPos.has(key)) seenPos.set(key, []);
      seenPos.get(key)!.push(String(ref).trim());
      excelRows.push({ ref: String(ref).trim(), panel: sheetName.trim(), col, row: rown });
    }
  }

  // Check conflicts in Excel
  console.log('=== CONFLICTOS EN EXCEL (misma posición para 2+ recambios) ===');
  let conflictCount = 0;
  for (const [pos, refs] of seenPos) {
    if (refs.length > 1) {
      console.log(`  ${pos}: ${refs.join(' vs ')}`);
      conflictCount++;
    }
  }
  if (conflictCount === 0) console.log('  Ningún conflicto encontrado');
  else console.log(`  Total: ${conflictCount} posiciones con conflicto`);

  // 2. Read DB
  const pool = await getPool();
  const dbResult = await pool.request().query(`
    SELECT id, referenciaCMH, nombre, panel, col, [row] FROM Recambios ORDER BY panel, col, [row]
  `);
  const dbRows = dbResult.recordset;
  console.log(`\nExcel: ${excelRows.length} recambios`);
  console.log(`DB: ${dbRows.length} recambios`);

  // 3. Map Excel by ref
  const excelByRef = new Map<string, { panel: string; col: number; row: number }>();
  for (const e of excelRows) {
    // If conflict, skip (don't set unreliable position)
    const key = `${e.panel}_C${e.col}F${e.row}`;
    if ((seenPos.get(key)?.length ?? 0) > 1) continue;
    // If already set, check for conflict
    if (excelByRef.has(e.ref)) {
      const existing = excelByRef.get(e.ref)!;
      if (existing.panel !== e.panel || existing.col !== e.col || existing.row !== e.row) {
        console.log(`  AVISO: ${e.ref} aparece en múltiples posiciones Excel: ${existing.panel} C${existing.col}F${existing.row} y ${e.panel} C${e.col}F${e.row}`);
      }
    } else {
      excelByRef.set(e.ref, { panel: e.panel, col: e.col, row: e.row });
    }
  }

  // 4. Compare
  let correctos = 0;
  let mover = 0;
  let noEnExcel = 0;
  let noEnDB = 0;
  let conflictivos = 0;

  console.log('\n=== RECAMBIOS EN DB QUE DIFIEREN DE EXCEL ===');
  for (const db of dbRows) {
    const ref = (db.referenciaCMH as string).trim();
    const dbPos = `${db.panel} C${db.col}F${db.row}`;
    const expected = excelByRef.get(ref);
    if (!expected) {
      console.log(`  ${ref} (${(db.nombre as string).substring(0, 20)}): DB=${dbPos} → NO ESTÁ EN EXCEL`);
      noEnExcel++;
      continue;
    }
    const expectedPos = `${expected.panel} C${expected.col}F${expected.row}`;
    if (dbPos !== expectedPos) {
      console.log(`  ${ref}: DB=${dbPos} → Excel=${expectedPos}`);
      mover++;
    } else {
      correctos++;
    }
  }

  console.log('\n=== RECAMBIOS EN EXCEL QUE NO ESTÁN EN DB ===');
  for (const e of excelRows) {
    const key = `${e.panel}_C${e.col}F${e.row}`;
    if ((seenPos.get(key)?.length ?? 0) > 1) continue;
    const db = dbRows.find(d => (d.referenciaCMH as string).trim() === e.ref);
    if (!db) {
      // Check if in DB with different name
      const other = dbRows.find(d => (d.referenciaCMH as string).trim().includes(e.ref) || e.ref.includes((d.referenciaCMH as string).trim()));
      if (other) {
        console.log(`  ${e.ref} → posición Excel ${e.panel} C${e.col}F${e.row} → parece ser DB ID ${other.id} (${other.referenciaCMH}) en ${other.panel} C${other.col}F${other.row}`);
      } else {
        console.log(`  ${e.ref} → posición Excel ${e.panel} C${e.col}F${e.row} → NO EXISTE EN DB`);
      }
      noEnDB++;
    }
  }

  // Count conflictivos in DB
  for (const db of dbRows) {
    const ref = (db.referenciaCMH as string).trim();
    const key = `${db.panel}_C${db.col}F${db.row}`;
    if ((seenPos.get(key)?.length ?? 0) > 1) {
      conflictivos++;
    }
  }

  console.log(`\n=== RESUMEN ===`);
  console.log(`  Correctos: ${correctos}`);
  console.log(`  Mover: ${mover}`);
  console.log(`  No están en Excel: ${noEnExcel}`);
  console.log(`  No existen en DB: ${noEnDB}`);
  console.log(`  En posiciones conflictivas del Excel: ${conflictivos}`);

  await pool.close();
}

main().catch(console.error);
