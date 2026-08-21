import { getPool, sql } from '../config/db.js';
import { env } from '../config/env.js';
import sharp from 'sharp';

const FRAME_SIZE = 400;
const INNER = 280;
const MARGIN = 55;
const CONCURRENCY = 5;

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (res.ok) {
      const ct = res.headers.get('content-type') || '';
      if (ct.startsWith('image/')) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 2000) {
          return buf;
        }
      }
    }
  } catch { }
  return null;
}

function makeWhiteStrip(w: number, h: number): Promise<Buffer> {
  return sharp({ create: { width: w, height: h, channels: 3, background: { r: 255, g: 255, b: 255 } } })
    .jpeg({ quality: 85 }).toBuffer();
}

async function processImageBuffer(buffer: Buffer): Promise<Buffer> {
  const meta = await sharp(buffer).metadata();
  console.log(`      Original: ${meta.width}x${meta.height}`);

  // Trim white space around the product, then resize to consistent size
  const trimmed = await sharp(buffer)
    .trim({ threshold: 15 })
    .jpeg({ quality: 85 })
    .toBuffer();

  const trimMeta = await sharp(trimmed).metadata();
  console.log(`      Trimmed: ${trimMeta.width}x${trimMeta.height}`);

  const resized = await sharp(trimmed)
    .resize({ width: INNER, height: INNER, fit: 'inside', withoutEnlargement: false })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 85 })
    .toBuffer();

  const composite = await sharp({
    create: { width: FRAME_SIZE, height: FRAME_SIZE, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .composite([
      { input: resized, gravity: 'center' },
      { input: await makeWhiteStrip(FRAME_SIZE, MARGIN), top: 0, left: 0 },
      { input: await makeWhiteStrip(FRAME_SIZE, MARGIN), top: FRAME_SIZE - MARGIN, left: 0 },
      { input: await makeWhiteStrip(MARGIN, FRAME_SIZE - MARGIN * 2), top: MARGIN, left: 0 },
      { input: await makeWhiteStrip(MARGIN, FRAME_SIZE - MARGIN * 2), top: MARGIN, left: FRAME_SIZE - MARGIN },
    ])
    .jpeg({ quality: 85 })
    .toBuffer();

  return composite;
}

async function uploadToAzure(buffer: Buffer, cmhReference: string): Promise<string> {
  const sasUrl = env.AZURE_BLOB_SAS_URL;
  const safeName = cmhReference.replace(/[/\\?%*:|"<>]/g, '-').replace(/\n/g, '');
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

async function processOne(product: any, pool: any): Promise<string> {
  const url = product.image;
  console.log(`  Downloading: ${url}`);
  const buf = await downloadImage(url);
  if (!buf) return `    SKIP (download failed)`;
  const processed = await processImageBuffer(buf);
  const newUrl = await uploadToAzure(processed, product.cmhReference);
  await pool.request()
    .input('image', sql.NVarChar(500), newUrl)
    .input('id', sql.Int, product.id)
    .query('UPDATE Products SET image = @image, updatedAt = SYSUTCDATETIME() WHERE id = @id');
  return `    OK -> ${newUrl}`;
}

async function main() {
  const pool = await getPool();

  const result = await pool.request()
    .query("SELECT id, cmhReference, image FROM Products WHERE image IS NOT NULL ORDER BY id");
  const products = result.recordset;
  console.log(`Total: ${products.length} products con image\n`);

  let done = 0;
  const errors: string[] = [];

  for (let i = 0; i < products.length; i += CONCURRENCY) {
    const batch = products.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map(r => processOne(r, pool))
    );
    for (let j = 0; j < batch.length; j++) {
      const r = batch[j];
      if (results[j].status === 'fulfilled') {
        console.log(`[${++done}/${products.length}] ${r.cmhReference} (ID=${r.id})`);
        console.log(results[j].value);
      } else {
        console.log(`[${++done}/${products.length}] ${r.cmhReference} (ID=${r.id}) ERROR`);
        console.log(`    ${results[j].reason}`);
        errors.push(`${r.cmhReference} (ID=${r.id}): ${results[j].reason}`);
      }
    }
  }

  await pool.close();
  console.log(`\nDone! ${done} processed, ${errors.length} errors`);
  if (errors.length) {
    console.log('Errors:');
    errors.forEach(e => console.log(`  - ${e}`));
  }
}

main().catch(console.error);
