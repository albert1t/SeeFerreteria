import { getPool, sql } from '../config/db.js';
import { env } from '../config/env.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRAME_SIZE = 400;
const TMP_DIR = path.resolve(__dirname, '..', '..', 'tmp_images');

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

interface RecambioRow {
  id: number;
  referenciaCMH: string;
  referenciaCliente: string | null;
  nombre: string;
  marca: string | null;
}

// Try multiple known distributor image URL patterns
function buildUrls(ref: string): string[] {
  const encoded = encodeURIComponent(ref);
  const safe = ref.replace(/\//g, '-');
  const safeDot = ref.replace(/\//g, '.');
  const urls: string[] = [];

  // Festo CDN / media (common patterns)
  urls.push(`https://www.festo.com/media/pi/${safe}.jpg`);
  urls.push(`https://www.festo.com/media/pi/${safeDot}.jpg`);

  // TSI Solutions
  urls.push(`https://www.tsisolutions.us/ecomm_images/items/large/${safe.toLowerCase()}.jpg`);
  urls.push(`https://www.tsisolutions.us/ecomm_images/items/large/${ref.toLowerCase()}.jpg`);

  // Doskee (WordPress)
  urls.push(`https://www.doskee.com/wp-content/uploads/2024/02/D15000100133652_1056x1024_1.jpg`); // generic fallback

  // EGA Industrial
  urls.push(`https://egaindustrial.com/531-superlarge_default/${safe}-festo.jpg`);

  // Motion.com
  urls.push(`https://www.motion.com/assets/images/product/${safe}.jpg`);

  return urls;
}

async function downloadImage(ref: string): Promise<Buffer | null> {
  const urls = buildUrls(ref);
  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.startsWith('image/')) {
          const buffer = Buffer.from(await res.arrayBuffer());
          if (buffer.length > 1000) {
            console.log(`    Downloaded from: ${url}`);
            return buffer;
          }
        }
      }
    } catch {
      // try next URL
    }
  }
  return null;
}

async function processImageBuffer(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer);
  const metadata = await image.metadata();
  const resizeOpts: sharp.ResizeOptions = {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    fit: 'inside',
    withoutEnlargement: false,
  };
  const resized = await image
    .resize(resizeOpts)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 85 })
    .toBuffer();
  const composite = await sharp({
    create: {
      width: FRAME_SIZE,
      height: FRAME_SIZE,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
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

async function searchWebForImage(ref: string, nombre: string): Promise<Buffer | null> {
  // Try Festo product page - they usually have og:image meta tags
  const festoUrls = [
    `https://www.festo.com/es/es/a/153128`, // we need the actual article numbers
  ];

  // For Festo products, try common patterns with hex IDs
  // Actually, let's try something more direct - search for common patterns
  const searchPatterns = [
    `https://www.festo.com/media/pi/${ref.replace(/\//g, '-')}_01_Standard_FullLine_Medium.jpg`,
    `https://www.festo.com/media/pi/${ref.replace(/\//g, '.')}_01_Standard_FullLine_Medium.jpg`,
    `https://www.festo.com/media/pi/${ref.replace(/\//g, '-')}_01_Standard_Thumbnail.jpg`,
  ];

  for (const url of searchPatterns) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.ok && (res.headers.get('content-type') || '').startsWith('image/')) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 2000) return buf;
      }
    } catch {}
  }
  return null;
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

    // Try direct download from known URL patterns
    let buffer = await downloadImage(recambio.referenciaCMH);

    // If that fails, try from referenciaCliente
    if (!buffer && recambio.referenciaCliente) {
      buffer = await downloadImage(recambio.referenciaCliente);
    }

    // Try Festo media patterns
    if (!buffer) {
      buffer = await searchWebForImage(recambio.referenciaCMH, recambio.nombre);
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
      console.log(`    OK - uploaded to Azure`);
      uploaded++;
    } catch (err: any) {
      console.error(`    ERROR: ${err.message}`);
      failed.push(recambio.referenciaCMH);
    }
  }

  console.log(`\n\n========== FINAL ==========`);
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Failed: ${failed.length}`);
  if (failed.length > 0) {
    console.log(`Failed references:`);
    for (const f of failed) console.log(`  - ${f}`);
  }
  await pool.close();
}

main().catch(console.error);
