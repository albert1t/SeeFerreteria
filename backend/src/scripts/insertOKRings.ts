import { getPool, sql } from '../config/db.js';

async function main() {
  const pool = await getPool();

  // Get familias
  const famResult = await pool.request().query(`SELECT id, nombre FROM Familias ORDER BY nombre`);
  console.log('=== FAMILIAS ===');
  for (const f of famResult.recordset) {
    console.log(`  ${f.id}: ${f.nombre}`);
  }

  // Check if A6 C1 positions are empty
  for (let row = 1; row <= 4; row++) {
    const occ = await pool.request()
      .input('row', sql.TinyInt, row)
      .query(`SELECT id, referenciaCMH FROM Recambios WHERE panel = 'A6' AND col = 1 AND [row] = @row`);
    if (occ.recordset.length > 0) {
      console.log(`\nA6 C1F${row} ocupado por ${occ.recordset[0].referenciaCMH} (ID ${occ.recordset[0].id})`);
    } else {
      console.log(`\nA6 C1F${row} LIBRE`);
    }
  }

  // Get max id for image naming
  const maxId = await pool.request().query(`SELECT MAX(id) as maxId FROM Recambios`);
  const nextId = (maxId.recordset[0].maxId || 0) + 1;

  // Festo generic sealing ring image (same physical appearance for all OK rings)
  const imgUrl = 'https://cdn.sp-spareparts.com/assets/img/prodcat/festo/processed/festo-d15000100119958-1056x1024.big.jpg';

  const rings = [
    { ref: 'OK-M5', row: 1, metric: 'M5', desc: 'Anillo de junta para rosca M5', partNo: '130850' },
    { ref: 'OK-1/8', row: 2, metric: 'G1/8', desc: 'Anillo de junta para rosca 1/8"', partNo: '531771' },
    { ref: 'OK-1/4', row: 3, metric: 'G1/4', desc: 'Anillo de junta para rosca 1/4"', partNo: '531772' },
    { ref: 'OK-3/8', row: 4, metric: 'G3/8', desc: 'Anillo de junta para rosca 3/8"', partNo: '531773' },
  ];

  // Try to get familiaId for "Junta" or "Accesorios" or similar
  let familiaId: number | null = null;
  for (const f of famResult.recordset) {
    const name = (f.nombre as string).toLowerCase();
    if (name.includes('junta') || name.includes('accesorio') || name.includes('anillo') || name.includes('sell')) {
      familiaId = f.id;
      console.log(`\nUsando familia: ${f.nombre} (ID ${familiaId})`);
      break;
    }
  }
  // Default to first familia if no match
  if (!familiaId && famResult.recordset.length > 0) {
    familiaId = famResult.recordset[0].id;
    console.log(`\nUsando primera familia disponible: ${famResult.recordset[0].nombre} (ID ${familiaId})`);
  }

  if (!familiaId) {
    console.log('\nNo hay familias en la DB. Cancelando inserción.');
    await pool.close();
    return;
  }

  console.log('\n=== INSERTANDO RECAMBIOS ===');
  for (const ring of rings) {
    // Check if ref already exists
    const existing = await pool.request()
      .input('ref', ring.ref)
      .query(`SELECT id FROM Recambios WHERE referenciaCMH = @ref`);
    if (existing.recordset.length > 0) {
      console.log(`  ${ring.ref} YA EXISTE (ID ${existing.recordset[0].id}) — saltando`);
      continue;
    }

    try {
      await pool.request()
        .input('ref', sql.NVarChar(50), ring.ref)
        .input('nombre', sql.NVarChar(100), `Anillo de junta ${ring.ref}`)
        .input('marca', sql.NVarChar(50), 'Festo')
        .input('referenciaCliente', sql.NVarChar(50), ring.partNo)
        .input('descripcion', sql.NVarChar(500), ring.desc)
        .input('metrica', sql.NVarChar(50), ring.metric)
        .input('unidadEmbalaje', sql.NVarChar(50), '1')
        .input('plazoEntrega', sql.NVarChar(50), '3 días')
        .input('nReposicion', sql.Int, 10)
        .input('familiaId', sql.Int, familiaId)
        .input('panel', sql.NVarChar(10), 'A6')
        .input('col', sql.TinyInt, 1)
        .input('row', sql.TinyInt, ring.row)
        .input('imagen', sql.NVarChar(500), imgUrl)
        .input('oculto', sql.Bit, false)
        .query(`
          INSERT INTO Recambios (referenciaCMH, nombre, marca, referenciaCliente, descripcion, metrica, unidadEmbalaje, plazoEntrega, nReposicion, familiaId, panel, col, [row], imagen, oculto, createdAt, updatedAt)
          VALUES (@ref, @nombre, @marca, @referenciaCliente, @descripcion, @metrica, @unidadEmbalaje, @plazoEntrega, @nReposicion, @familiaId, @panel, @col, @row, @imagen, @oculto, SYSUTCDATETIME(), SYSUTCDATETIME())
        `);
      console.log(`  ✅ ${ring.ref} insertado en A6 C1F${ring.row}`);
    } catch (err: any) {
      console.log(`  ❌ ${ring.ref}: ${err.message}`);
    }
  }

  // Verify
  console.log('\n=== VERIFICACIÓN ===');
  const verify = await pool.request()
    .query(`SELECT id, referenciaCMH, nombre, panel, col, [row], imagen FROM Recambios WHERE panel = 'A6' AND col = 1 AND [row] BETWEEN 1 AND 4 ORDER BY [row]`);
  for (const v of verify.recordset) {
    console.log(`  F${v.row}: id=${v.id} ref="${v.referenciaCMH}" nombre="${v.nombre}"`);
  }

  await pool.close();
}

main().catch(console.error);
