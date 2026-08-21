import { getPool, sql } from '../config/db.js';
import { env } from '../config/env.js';
import sharp from 'sharp';

const PADDING = 30;

async function fetchImage(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return buf;
}

async function addPadding(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer);
  const meta = await image.metadata();
  const w = meta.width ?? 400;
  const h = meta.height ?? 400;
  const pad = PADDING;

  const padded = await sharp({
    create: {
      width: w + pad * 2,
      height: h + pad * 2,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([{ input: buffer, top: pad, left: pad }])
    .jpeg({ quality: 85 })
    .toBuffer();

  return padded;
}

async function uploadToAzure(buffer: Buffer, cmhReference: string): Promise<string> {
  const sasUrl = env.AZURE_BLOB_SAS_URL;
  const safeName = cmhReference.replace(/[/\\?%*:|"<>]/g, '-');
  const blobName = `product-image/product-${safeName}-${Date.now()}.jpg`;
  const [baseUrl, sasToken] = sasUrl.split('?');
  const blobUrl = `${baseUrl}/${blobName}?${sasToken}`;

  const azureRes = await fetch(blobUrl, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': 'image/jpeg',
      'Content-Length': String(buffer.length),
    },
    body: buffer as unknown as BodyInit,
  });

  if (!azureRes.ok) {
    const errorText = await azureRes.text().catch(() => azureRes.statusText);
    throw new Error(`Azure Blob error ${azureRes.status}: ${errorText}`);
  }

  return `${baseUrl}/${blobName}`;
}

async function main() {
  console.log('Connecting to database...');
  const pool = await getPool();
  console.log('Connected.');

  const result = await pool.request().query<{ id: number; cmhReference: string; image: string }>(`
    SELECT id, cmhReference, image
    FROM Products
    WHERE image IS NOT NULL AND image LIKE '%ferreteriastorageacc%'
    ORDER BY id
  `);
  const products = result.recordset;
  console.log(`Found ${products.length} products with Azure images.`);

  let ok = 0;
  let errors: string[] = [];

  for (const r of products) {
    process.stdout.write(`[${ok + errors.length + 1}/${products.length}] ${r.cmhReference} ... `);
    try {
      const buf = await fetchImage(r.image);
      const padded = await addPadding(buf);
      const newUrl = await uploadToAzure(padded, r.cmhReference);
      await pool.request()
        .input('image', sql.NVarChar(500), newUrl)
        .input('id', sql.Int, r.id)
        .query('UPDATE Products SET image = @image, updatedAt = SYSUTCDATETIME() WHERE id = @id');
      console.log(`OK`);
      ok++;
    } catch (err: any) {
      console.log(`ERROR: ${err.message}`);
      errors.push(`${r.cmhReference}: ${err.message}`);
    }
  }

  console.log('\n========== SUMMARY ==========');
  console.log(`Total:     ${products.length}`);
  console.log(`OK:        ${ok}`);
  console.log(`Errors:    ${errors.length}`);
  if (errors.length > 0) {
    for (const e of errors) console.error(`  - ${e}`);
  }
  console.log('=============================');
  await pool.close();
}

main().catch(console.error);
