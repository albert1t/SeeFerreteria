import { getPool, sql } from '../config/db.js';

async function main() {
  const pool = await getPool();

  // Get families
  const famResult = await pool.request().query(`SELECT id, name FROM Families ORDER BY name`);
  console.log('=== FAMILIAS ===');
  for (const f of famResult.recordset) {
    console.log(`  ${f.id}: ${f.name}`);
  }

  // Check if A6 C1 positions are empty
  for (let row = 1; row <= 4; row++) {
    const occ = await pool.request()
      .input('row', sql.TinyInt, row)
      .query(`SELECT id, cmhReference FROM Products WHERE panel = 'A6' AND col = 1 AND [row] = @row`);
    if (occ.recordset.length > 0) {
      console.log(`\nA6 C1F${row} ocupado por ${occ.recordset[0].cmhReference} (ID ${occ.recordset[0].id})`);
    } else {
      console.log(`\nA6 C1F${row} LIBRE`);
    }
  }

  // Get max id for image naming
  const maxId = await pool.request().query(`SELECT MAX(id) as maxId FROM Products`);
  const nextId = (maxId.recordset[0].maxId || 0) + 1;

  // Festo generic sealing ring image (same physical appearance for all OK rings)
  const imgUrl = 'https://cdn.sp-spareparts.com/assets/img/prodcat/festo/processed/festo-d15000100119958-1056x1024.big.jpg';

  const rings = [
    { ref: 'OK-M5', row: 1, metric: 'M5', desc: 'Anillo de junta para rosca M5', partNo: '130850' },
    { ref: 'OK-1/8', row: 2, metric: 'G1/8', desc: 'Anillo de junta para rosca 1/8"', partNo: '531771' },
    { ref: 'OK-1/4', row: 3, metric: 'G1/4', desc: 'Anillo de junta para rosca 1/4"', partNo: '531772' },
    { ref: 'OK-3/8', row: 4, metric: 'G3/8', desc: 'Anillo de junta para rosca 3/8"', partNo: '531773' },
  ];

  // Try to get familyId for "Junta" or "Accesorios" or similar
  let familyId: number | null = null;
  for (const f of famResult.recordset) {
    const name = (f.name as string).toLowerCase();
    if (name.includes('junta') || name.includes('accesorio') || name.includes('anillo') || name.includes('sell')) {
      familyId = f.id;
      console.log(`\nUsando family: ${f.name} (ID ${familyId})`);
      break;
    }
  }
  // Default to first family if no match
  if (!familyId && famResult.recordset.length > 0) {
    familyId = famResult.recordset[0].id;
    console.log(`\nUsando primera family disponible: ${famResult.recordset[0].name} (ID ${familyId})`);
  }

  if (!familyId) {
    console.log('\nNo hay families en la DB. Cancelando inserción.');
    await pool.close();
    return;
  }

  console.log('\n=== INSERTANDO RECAMBIOS ===');
  for (const ring of rings) {
    // Check if ref already exists
    const existing = await pool.request()
      .input('ref', ring.ref)
      .query(`SELECT id FROM Products WHERE cmhReference = @ref`);
    if (existing.recordset.length > 0) {
      console.log(`  ${ring.ref} YA EXISTE (ID ${existing.recordset[0].id}) — saltando`);
      continue;
    }

    try {
      await pool.request()
        .input('ref', sql.NVarChar(50), ring.ref)
        .input('name', sql.NVarChar(100), `Anillo de junta ${ring.ref}`)
        .input('brand', sql.NVarChar(50), 'Festo')
        .input('customerReference', sql.NVarChar(50), ring.partNo)
        .input('description', sql.NVarChar(500), ring.desc)
        .input('metric', sql.NVarChar(50), ring.metric)
        .input('packagingUnit', sql.NVarChar(50), '1')
        .input('deliveryTime', sql.NVarChar(50), '3 días')
        .input('reorderPoint', sql.Int, 10)
        .input('familyId', sql.Int, familyId)
        .input('panel', sql.NVarChar(10), 'A6')
        .input('col', sql.TinyInt, 1)
        .input('row', sql.TinyInt, ring.row)
        .input('image', sql.NVarChar(500), imgUrl)
        .input('hidden', sql.Bit, false)
        .query(`
          INSERT INTO Products (cmhReference, name, brand, customerReference, description, metric, packagingUnit, deliveryTime, reorderPoint, familyId, panel, col, [row], image, hidden, createdAt, updatedAt)
          VALUES (@ref, @name, @brand, @customerReference, @description, @metric, @packagingUnit, @deliveryTime, @reorderPoint, @familyId, @panel, @col, @row, @image, @hidden, SYSUTCDATETIME(), SYSUTCDATETIME())
        `);
      console.log(`  ✅ ${ring.ref} insertado en A6 C1F${ring.row}`);
    } catch (err: any) {
      console.log(`  ❌ ${ring.ref}: ${err.message}`);
    }
  }

  // Verify
  console.log('\n=== VERIFICACIÓN ===');
  const verify = await pool.request()
    .query(`SELECT id, cmhReference, name, panel, col, [row], image FROM Products WHERE panel = 'A6' AND col = 1 AND [row] BETWEEN 1 AND 4 ORDER BY [row]`);
  for (const v of verify.recordset) {
    console.log(`  F${v.row}: id=${v.id} ref="${v.cmhReference}" name="${v.name}"`);
  }

  await pool.close();
}

main().catch(console.error);
