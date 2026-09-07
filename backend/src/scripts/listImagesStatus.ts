import { getPool, closePool } from '../config/db.js';

async function main() {
  const pool = await getPool();

  const [totalRows]: any[] = await pool.query('SELECT COUNT(*) AS cnt FROM Products');
  const [azureRows]: any[] = await pool.query("SELECT COUNT(*) AS cnt FROM Products WHERE image LIKE '%ferreteriastorageacc%'");
  const [placeholderRows]: any[] = await pool.query("SELECT COUNT(*) AS cnt FROM Products WHERE image LIKE '%placehold.co%'");
  const [nullRows]: any[] = await pool.query("SELECT COUNT(*) AS cnt FROM Products WHERE image IS NULL OR image = ''");
  const [externalRows]: any[] = await pool.query("SELECT COUNT(*) AS cnt FROM Products WHERE image IS NOT NULL AND image != '' AND image NOT LIKE '%ferreteriastorageacc%' AND image NOT LIKE '%placehold.co%'");

  console.log('========== IMAGE STATUS ==========');
  console.log(`Total products:        ${totalRows[0].cnt}`);
  console.log(`With Azure image:      ${azureRows[0].cnt}`);
  console.log(`With placeholder:      ${placeholderRows[0].cnt}`);
  console.log(`No image (NULL/empty): ${nullRows[0].cnt}`);
  console.log(`With external URL:     ${externalRows[0].cnt}`);
  console.log('==================================\n');

  const [products]: any[] = await pool.query(`
    SELECT p.id, p.cmhReference, p.customerReference, p.name, p.brand, p.familyId, p.image,
           f.name AS familyName
    FROM Products p
    LEFT JOIN Families f ON f.id = p.familyId
    WHERE p.image IS NULL OR p.image = '' OR p.image NOT LIKE '%ferreteriastorageacc%'
    ORDER BY p.id
  `);

  console.log(`Products needing real images: ${products.length}\n`);
  for (const p of products) {
    const img = p.image || 'NULL';
    console.log(`${p.id} | ${p.cmhReference} | ${p.customerReference || ''} | ${p.name} | ${p.brand || ''} | ${p.familyName || ''} | ${img.substring(0, 80)}`);
  }

  await closePool();
}

main().catch(console.error);
