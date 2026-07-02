import { getPool, sql } from '../config/db.js';
import { env } from '../config/env.js';
import sharp from 'sharp';

const FRAME_SIZE = 400;

async function generateRingImage(): Promise<Buffer> {
  // Create an SVG of a metallic sealing ring on white
  const svg = `<svg width="${FRAME_SIZE}" height="${FRAME_SIZE}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#999"/>
        <stop offset="30%" stop-color="#ddd"/>
        <stop offset="50%" stop-color="#777"/>
        <stop offset="70%" stop-color="#bbb"/>
        <stop offset="100%" stop-color="#666"/>
      </linearGradient>
      <filter id="shadow">
        <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.15"/>
      </filter>
    </defs>
    <rect width="${FRAME_SIZE}" height="${FRAME_SIZE}" fill="white"/>
    <circle cx="${FRAME_SIZE / 2}" cy="${FRAME_SIZE / 2}" r="120" fill="none" stroke="url(#ringGrad)" stroke-width="50" filter="url(#shadow)"/>
  </svg>`;

  const buf = await sharp(Buffer.from(svg))
    .resize(FRAME_SIZE, FRAME_SIZE)
    .jpeg({ quality: 85 })
    .toBuffer();
  return buf;
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

  const result = await pool.request()
    .query(`SELECT id, referenciaCMH, imagen FROM Recambios WHERE panel = 'A6' AND col = 1 AND [row] BETWEEN 1 AND 4 ORDER BY [row]`);
  const rings = result.recordset;
  console.log(`Encontrados ${rings.length} anillos OK\n`);

  const ringBuffer = await generateRingImage();
  console.log(`Imagen generada: ${ringBuffer.length} bytes`);

  for (const r of rings) {
    console.log(`[${r.referenciaCMH}] ID=${r.id}`);
    const url = await uploadToAzure(ringBuffer, r.referenciaCMH);
    await pool.request()
      .input('imagen', sql.NVarChar(500), url)
      .input('id', sql.Int, r.id)
      .query('UPDATE Recambios SET imagen = @imagen, updatedAt = SYSUTCDATETIME() WHERE id = @id');
    console.log(`  -> ${url}`);
  }

  await pool.close();
  console.log('\nDone!');
}

main().catch(console.error);
