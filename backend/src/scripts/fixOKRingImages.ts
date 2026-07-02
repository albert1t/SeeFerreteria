import { getPool, sql } from '../config/db.js';
import { env } from '../config/env.js';
import sharp from 'sharp';

const FRAME_SIZE = 400;

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (res.ok) {
      const ct = res.headers.get('content-type') || '';
      if (ct.startsWith('image/')) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 2000) {
          console.log(`    Downloaded: ${url} (${buf.length} bytes)`);
          return buf;
        }
      }
    }
  } catch (e: any) {
    console.log(`    Fetch failed: ${e.message}`);
  }
  return null;
}

function makeWhiteStrip(w: number, h: number): Promise<Buffer> {
  return sharp({ create: { width: w, height: h, channels: 3, background: { r: 255, g: 255, b: 255 } } })
    .jpeg({ quality: 85 }).toBuffer();
}

async function processImageBuffer(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer);
  const meta = await image.metadata();
  console.log(`    Original: ${meta.width}x${meta.height}`);

  // Resize the ring smaller (280x280) so it has 60px padding on all sides
  const INNER = 280;
  const resized = await image
    .resize({ width: INNER, height: INNER, fit: 'inside', withoutEnlargement: false })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 85 })
    .toBuffer();

  // Center on 400x400 white canvas, then cover all 4 edges to remove any text
  const MARGIN = 55;
  const composite = await sharp({
    create: { width: FRAME_SIZE, height: FRAME_SIZE, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .composite([
      { input: resized, gravity: 'center' },
      // Top strip (full width)
      { input: await makeWhiteStrip(FRAME_SIZE, MARGIN), top: 0, left: 0 },
      // Bottom strip (full width)
      { input: await makeWhiteStrip(FRAME_SIZE, MARGIN), top: FRAME_SIZE - MARGIN, left: 0 },
      // Left strip (remaining middle height)
      { input: await makeWhiteStrip(MARGIN, FRAME_SIZE - MARGIN * 2), top: MARGIN, left: 0 },
      // Right strip (remaining middle height)
      { input: await makeWhiteStrip(MARGIN, FRAME_SIZE - MARGIN * 2), top: MARGIN, left: FRAME_SIZE - MARGIN },
    ])
    .jpeg({ quality: 85 })
    .toBuffer();

  return composite;
}

async function uploadToAzure(buffer: Buffer, referenciaCMH: string): Promise<string> {
  const sasUrl = env.AZURE_BLOB_SAS_URL;
  const safeName = referenciaCMH.replace(/[/\\?%*:|"<>]/g, '-').replace(/\n/g, '');
  const blobName = `product-image/recambio-${safeName}-${Date.now()}.jpg`;
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

  // Get OK rings from DB
  const result = await pool.request()
    .query(`SELECT id, referenciaCMH, imagen FROM Recambios WHERE panel = 'A6' AND col = 1 AND [row] BETWEEN 1 AND 4 ORDER BY [row]`);

  console.log(`Encontrados ${result.recordset.length} OK rings`);
  const sourceUrl = 'https://cdn.sp-spareparts.com/assets/img/prodcat/festo/processed/festo-d15000100119958-1056x1024.big.jpg';

  for (const recambio of result.recordset) {
    console.log(`\n[${recambio.referenciaCMH}] ID=${recambio.id}`);
    
    const buffer = await downloadImage(sourceUrl);
    if (!buffer) {
      console.log('    Failed to download image');
      continue;
    }

    const processed = await processImageBuffer(buffer);
    const url = await uploadToAzure(processed, recambio.referenciaCMH);

    await pool.request()
      .input('imagen', sql.NVarChar(500), url)
      .input('id', sql.Int, recambio.id)
      .query('UPDATE Recambios SET imagen = @imagen, updatedAt = SYSUTCDATETIME() WHERE id = @id');

    console.log(`    Updated -> ${url}`);
  }

  await pool.close();
  console.log('\nDone!');
}

main().catch(console.error);
