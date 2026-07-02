import { getPool, sql } from '../config/db.js';
import { env } from '../config/env.js';
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '../../..');

const FRAME_SIZE = 400;
const INNER = 280;
const MARGIN = 55;

function makeWhiteStrip(w: number, h: number): Promise<Buffer> {
  return sharp({ create: { width: w, height: h, channels: 3, background: { r: 255, g: 255, b: 255 } } })
    .jpeg({ quality: 85 }).toBuffer();
}

async function processImageBuffer(buffer: Buffer): Promise<Buffer> {
  const trimmed = await sharp(buffer)
    .trim({ threshold: 15 })
    .jpeg({ quality: 85 })
    .toBuffer();

  const resized = await sharp(trimmed)
    .resize({ width: INNER, height: INNER, fit: 'inside', withoutEnlargement: false })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 85 })
    .toBuffer();

  return sharp({
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
}

async function uploadToAzure(buffer: Buffer, prefix: string): Promise<string> {
  const sasUrl = env.AZURE_BLOB_SAS_URL;
  const blobName = `product-image/recambio-${prefix}-${Date.now()}.jpg`;
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
  const pool = await getPool();

  // Process OK ring image
  console.log('=== Procesando Anillo de junta OK.png ===');
  const okBuf = readFileSync(join(ROOT, 'Anillo de junta OK.png'));
  const okMeta = await sharp(okBuf).metadata();
  console.log(`  Original: ${okMeta.width}x${okMeta.height} (${okMeta.format})`);
  const okProcessed = await processImageBuffer(okBuf);
  console.log(`  Procesado: ${okProcessed.length} bytes`);
  const okUrl = await uploadToAzure(okProcessed, 'OK-ring');
  console.log(`  URL: ${okUrl}\n`);

  // Process OL ring image
  console.log('=== Procesando Anillo de junta OL.jpg ===');
  const olBuf = readFileSync(join(ROOT, 'Anillo de junta OL.jpg'));
  const olMeta = await sharp(olBuf).metadata();
  console.log(`  Original: ${olMeta.width}x${olMeta.height} (${olMeta.format})`);
  const olProcessed = await processImageBuffer(olBuf);
  console.log(`  Procesado: ${olProcessed.length} bytes`);
  const olUrl = await uploadToAzure(olProcessed, 'OL-ring');
  console.log(`  URL: ${olUrl}\n`);

  // Update OK rings (A6 C1 F1-F4)
  console.log('=== Actualizando OK rings ===');
  const okResult = await pool.request()
    .query(`SELECT id, referenciaCMH FROM Recambios WHERE panel = 'A6' AND col = 1 AND [row] BETWEEN 1 AND 4 ORDER BY [row]`);
  for (const r of okResult.recordset) {
    await pool.request()
      .input('imagen', sql.NVarChar(500), okUrl)
      .input('id', sql.Int, r.id)
      .query('UPDATE Recambios SET imagen = @imagen, updatedAt = SYSUTCDATETIME() WHERE id = @id');
    console.log(`  ${r.referenciaCMH} (ID=${r.id})`);
  }

  // Update OL rings (A6 C1 F5-F10)
  console.log('=== Actualizando OL rings ===');
  const olResult = await pool.request()
    .query(`SELECT id, referenciaCMH FROM Recambios WHERE panel = 'A6' AND col = 1 AND [row] BETWEEN 5 AND 10 ORDER BY [row]`);
  for (const r of olResult.recordset) {
    await pool.request()
      .input('imagen', sql.NVarChar(500), olUrl)
      .input('id', sql.Int, r.id)
      .query('UPDATE Recambios SET imagen = @imagen, updatedAt = SYSUTCDATETIME() WHERE id = @id');
    console.log(`  ${r.referenciaCMH} (ID=${r.id})`);
  }

  await pool.close();
  console.log('\nDone!');
}

main().catch(console.error);
