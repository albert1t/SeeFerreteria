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

function collectAllImages(): { key: string; filepath: string; rawBasename: string }[] {
  const result: { key: string; filepath: string; rawBasename: string }[] = [];
  if (!fs.existsSync(IMG_FOLDER)) return result;
  const dirs = fs.readdirSync(IMG_FOLDER, { withFileTypes: true });
  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    const dirPath = path.join(IMG_FOLDER, dir.name);
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)) continue;
      const withoutExt = file.replace(/\.[^.]+$/, '').trim();
      result.push({
        key: withoutExt.toLowerCase(),
        filepath: path.join(dirPath, file),
        rawBasename: file,
      });
    }
  }
  return result;
}

async function processImage(filepath: string): Promise<Buffer> {
  const image = sharp(filepath);
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

async function main() {
  const pool = await getPool();

  const result = await pool.request().query<RecambioRow>(`
    SELECT id, referenciaCMH, referenciaCliente, nombre, imagen
    FROM Recambios
    WHERE imagen IS NULL OR imagen NOT LIKE '%ferreteriastorageacc%'
    ORDER BY id
  `);
  const recambios = result.recordset;
  console.log(`Recambios sin imagen Azure: ${recambios.length}`);

  const allImages = collectAllImages();
  console.log(`Total images in ImgFerreteria: ${allImages.length}`);

  let uploaded = 0;
  for (const recambio of recambios) {
    let matchPath: string | null = null;
    let matchKey: string | null = null;

    const cmh = recambio.referenciaCMH.trim().toLowerCase();
    const cli = recambio.referenciaCliente?.trim().toLowerCase() ?? '';

    // 1. exact match after normalizing / . _ -
    function norm(s: string): string {
      return s.replace(/[/\\_.]/g, '-').replace(/\s+/g, ' ').trim();
    }
    const cmhNorm = norm(cmh);
    const cliNorm = cli ? norm(cli) : '';

    for (const img of allImages) {
      const imgNorm = norm(img.key);
      if (imgNorm === cmhNorm || (cliNorm && imgNorm === cliNorm)) {
        matchPath = img.filepath;
        matchKey = img.rawBasename;
        break;
      }
    }

    // 2. prefix match: image starts with reference (e.g. TG-0204 smc.jpg -> TG-0204)
    if (!matchPath) {
      for (const img of allImages) {
        const imgKey = img.key.replace(/^\([^)]+\)\s*/, '').trim().toLowerCase();
        if (imgKey.startsWith(cmh) || (cli && imgKey.startsWith(cli))) {
          matchPath = img.filepath;
          matchKey = img.rawBasename;
          break;
        }
      }
    }

    if (!matchPath) {
      console.log(`  [SKIP] ${recambio.referenciaCMH} - no match`);
      continue;
    }

    console.log(`  [MATCH] ${recambio.referenciaCMH} -> ${matchKey}`);
    try {
      const processed = await processImage(matchPath);
      const url = await uploadToAzure(processed, recambio.referenciaCMH);
      await pool.request()
        .input('imagen', sql.NVarChar(500), url)
        .input('id', sql.Int, recambio.id)
        .query('UPDATE Recambios SET imagen = @imagen, updatedAt = SYSUTCDATETIME() WHERE id = @id');
      console.log(`    OK -> ${url}`);
      uploaded++;
    } catch (err: any) {
      console.error(`    ERROR: ${err.message}`);
    }
  }

  console.log(`\nUploaded in this pass: ${uploaded}`);
  await pool.close();
}

main().catch(console.error);
