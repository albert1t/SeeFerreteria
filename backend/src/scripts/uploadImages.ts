import { getPool, sql } from '../config/db.js';
import { env } from '../config/env.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_FOLDER = path.resolve(__dirname, '..', '..', '..', 'ImgFerreteria');
const FRAME_SIZE = 400;

interface RecambioRow {
  id: number;
  referenciaCMH: string;
  referenciaCliente: string | null;
  nombre: string;
  imagen: string | null;
}

function normalizeForMatch(name: string): string {
  return name
    .replace(/^\([^)]+\)\s*/, '')
    .replace(/\.[^.]+$/, '')
    .trim();
}

function normalizeSeparators(s: string): string {
  return s.replace(/[/\\_]/g, '-').replace(/\./g, '-').toLowerCase();
}

function collectImages(): Map<string, string> {
  const images = new Map<string, string>();
  if (!fs.existsSync(IMG_FOLDER)) {
    console.error(`Folder not found: ${IMG_FOLDER}`);
    return images;
  }
  const dirs = fs.readdirSync(IMG_FOLDER, { withFileTypes: true });
  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    const dirPath = path.join(IMG_FOLDER, dir.name);
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)) continue;
      const normalized = normalizeForMatch(file);
      const key = normalizeSeparators(normalized);
      if (!images.has(key)) {
        images.set(key, path.join(dirPath, file));
      }
    }
  }
  return images;
}

function findMatch(
  referenciaCMH: string,
  referenciaCliente: string | null,
  images: Map<string, string>
): string | null {
  const refs = [referenciaCMH];
  if (referenciaCliente) refs.push(referenciaCliente);

  for (const ref of refs) {
    const clean = ref.trim();
    const normKey = normalizeSeparators(clean);

    if (images.has(normKey)) return images.get(normKey)!;

    for (const [key, filepath] of images) {
      if (key === normKey) return filepath;
    }
  }
  return null;
}

async function processImage(filepath: string): Promise<Buffer> {
  const image = sharp(filepath);
  const metadata = await image.metadata();
  const width = metadata.width ?? 400;
  const height = metadata.height ?? 400;

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
    .composite([{
      input: resized,
      gravity: 'center',
    }])
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
  console.log('Connecting to database...');
  const pool = await getPool();
  console.log('Connected.');

  console.log('Querying all recambios...');
  const result = await pool.request().query<RecambioRow>(`
    SELECT id, referenciaCMH, referenciaCliente, nombre, imagen
    FROM Recambios
    ORDER BY id
  `);
  const recambios = result.recordset;
  console.log(`Found ${recambios.length} recambios.`);

  console.log('Scanning ImgFerreteria for images...');
  const images = collectImages();
  console.log(`Found ${images.size} images in ImgFerreteria.`);

  console.log('Available image keys:');
  for (const [key, fp] of images) {
    console.log(`  ${key} <- ${path.basename(fp)}`);
  }

  let matched = 0;
  let uploaded = 0;
  let skipped = 0;
  let errors: string[] = [];

  for (const recambio of recambios) {
    if (recambio.imagen && recambio.imagen.includes('ferreteriastorageacc')) {
      console.log(`  [SKIP] ${recambio.referenciaCMH} already has Azure image`);
      continue;
    }

    const matchPath = findMatch(recambio.referenciaCMH, recambio.referenciaCliente, images);

    if (!matchPath) {
      console.log(`  [SKIP] No image match for ${recambio.referenciaCMH} (${recambio.nombre})`);
      skipped++;
      continue;
    }

    matched++;
    console.log(`  [MATCH] ${recambio.referenciaCMH} -> ${path.basename(matchPath)}`);

    try {
      console.log(`    Processing image...`);
      const processed = await processImage(matchPath);

      console.log(`    Uploading to Azure...`);
      const url = await uploadToAzure(processed, recambio.referenciaCMH);

      console.log(`    Updating DB record ${recambio.id}...`);
      await pool.request()
        .input('imagen', sql.NVarChar(500), url)
        .input('id', sql.Int, recambio.id)
        .query('UPDATE Recambios SET imagen = @imagen, updatedAt = SYSUTCDATETIME() WHERE id = @id');

      console.log(`    OK -> ${url}`);
      uploaded++;
    } catch (err: any) {
      const msg = `Error processing ${recambio.referenciaCMH} (${path.basename(matchPath)}): ${err.message}`;
      console.error(`    ${msg}`);
      errors.push(msg);
    }
  }

  console.log('\n========== SUMMARY ==========');
  console.log(`Total recambios:     ${recambios.length}`);
  console.log(`Images found:        ${images.size}`);
  console.log(`Already had Azure:   ${recambios.filter(r => r.imagen?.includes('ferreteriastorageacc')).length}`);
  console.log(`Matched:             ${matched}`);
  console.log(`Uploaded & Updated:  ${uploaded}`);
  console.log(`Skipped (no match):  ${skipped}`);
  if (errors.length > 0) {
    console.log(`Errors:              ${errors.length}`);
    for (const e of errors) console.error(`  - ${e}`);
  }
  console.log('=============================');

  await pool.close();
}

main().catch(console.error);
