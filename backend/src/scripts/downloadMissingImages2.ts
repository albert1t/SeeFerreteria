import { getPool, sql } from '../config/db.js';
import { env } from '../config/env.js';
import sharp from 'sharp';

const FRAME_SIZE = 400;

interface RecambioRow {
  id: number;
  referenciaCMH: string;
  referenciaCliente: string | null;
  nombre: string;
  marca: string | null;
}

function normalizeRef(ref: string): string {
  return ref.replace(/\//g, '-').toLowerCase();
}

const TSI_BASE = 'https://www.tsisolutions.us/ecomm_images/items/large/';
const DOSKEE_FALLBACK = 'https://www.doskee.com/wp-content/uploads/2024/02/D15000100133652_1056x1024_1.jpg';

async function downloadImage(ref: string): Promise<Buffer | null> {
  const norm = normalizeRef(ref);
  const tsiUrl = `${TSI_BASE}${norm}.jpg`;

  // Try TSI Solutions
  try {
    const res = await fetch(tsiUrl, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const ct = res.headers.get('content-type') || '';
      if (ct.startsWith('image/')) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 1000) {
          console.log(`    Downloaded from TSI: ${norm}.jpg`);
          return buf;
        }
      }
    }
  } catch {}

  // Fallback: try doskee generic
  try {
    const res = await fetch(DOSKEE_FALLBACK, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 1000) {
        console.log(`    Using generic fallback image from Doskee`);
        return buf;
      }
    }
  } catch {}

  return null;
}

async function processImageBuffer(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer);
  const metadata = await image.metadata();
  const resizeOpts: sharp.ResizeOptions = {
    width: FRAME_SIZE, height: FRAME_SIZE, fit: 'inside', withoutEnlargement: false,
  };
  const resized = await image
    .resize(resizeOpts)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 85 })
    .toBuffer();
  const composite = await sharp({
    create: { width: FRAME_SIZE, height: FRAME_SIZE, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .composite([{ input: resized, gravity: 'center' }])
    .jpeg({ quality: 85 })
    .toBuffer();
  return composite;
}

async function uploadToAzure(buffer: Buffer, referenciaCMH: string): Promise<string> {
  const sasUrl = env.AZURE_BLOB_SAS_URL;
  const safeName = referenciaCMH.replace(/[/\\?%*:|"<>]/g, '-');
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
  const result = await pool.request().query<RecambioRow>(`
    SELECT id, referenciaCMH, referenciaCliente, nombre, marca
    FROM Recambios
    WHERE imagen IS NULL OR imagen NOT LIKE '%ferreteriastorageacc%'
    ORDER BY id
  `);
  const recambios = result.recordset;
  console.log(`Recambios sin imagen: ${recambios.length}`);

  let uploaded = 0;
  let failed: string[] = [];

  for (const recambio of recambios) {
    console.log(`\n[${recambio.id}] ${recambio.referenciaCMH} - ${recambio.nombre}`);

    let buffer = await downloadImage(recambio.referenciaCMH);
    if (!buffer && recambio.referenciaCliente) {
      buffer = await downloadImage(recambio.referenciaCliente);
    }

    if (!buffer) {
      console.log(`    No image found for ${recambio.referenciaCMH}`);
      failed.push(recambio.referenciaCMH);
      continue;
    }

    try {
      const processed = await processImageBuffer(buffer);
      const url = await uploadToAzure(processed, recambio.referenciaCMH);
      await pool.request()
        .input('imagen', sql.NVarChar(500), url)
        .input('id', sql.Int, recambio.id)
        .query('UPDATE Recambios SET imagen = @imagen, updatedAt = SYSUTCDATETIME() WHERE id = @id');
      console.log(`    OK - uploaded`);
      uploaded++;
    } catch (err: any) {
      console.error(`    ERROR: ${err.message}`);
      failed.push(recambio.referenciaCMH);
    }
  }

  console.log(`\n\n========== FINAL ==========`);
  console.log(`Uploaded this pass: ${uploaded}`);
  console.log(`Failed: ${failed.length}`);
  for (const f of failed) console.log(`  - ${f}`);
  await pool.close();
}

main().catch(console.error);
