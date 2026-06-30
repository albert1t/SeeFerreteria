import { getPool, sql } from '../config/db.js';
import { env } from '../config/env.js';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRAME_SIZE = 400;

const TARGETED_URLS: Record<string, string[]> = {
  'KQ2H\n16': [
    'https://www.smcusa.com/images/products/lg/KQ2H.jpg',
    'https://content2.smcetech.com/img/products/KQ2H/KQ2H_main.jpg',
    'https://www.tsisolutions.us/ecomm_images/items/large/kq2h16-00a.jpg',
    'https://www.tsisolutions.us/ecomm_images/items/large/kq2h16-02as.jpg',
    'https://www.doskee.com/wp-content/uploads/2024/02/D15000100133652_1056x1024_1.jpg',
  ],
  'AQ240F-04-00': [
    'https://www.smcusa.com/images/products/lg/AQ240F.jpg',
    'https://content2.smcetech.com/img/products/AQ/AQ240F_main.jpg',
    'https://www.tsisolutions.us/ecomm_images/items/large/aq240f-04-00.jpg',
    'https://cdn.awsli.com.br/2500x2500/2023/2023123/produto/119291827/85d1c74816.jpg',
  ],
  'AN20-C10': [
    'https://www.smcusa.com/images/products/lg/AN.jpg',
    'https://content2.smcetech.com/img/products/AN/AN_main.jpg',
    'https://endevoronline.com/3473-superlarge_default/silenciador-resina-compacto-conexion-instantanea-an20-c10-smc.jpg',
    'https://endevoronline.com/3474-superlarge_default/silenciador-resina-compacto-conexion-instantanea-an20-c10-smc.jpg',
    'https://www.tsisolutions.us/ecomm_images/items/large/an20-c10.jpg',
  ],
  '3699 04 10': [
    'https://www.tsisolutions.us/ecomm_images/items/large/3699-04-10.jpg',
    'https://ph.parker.com/images/products/lg/3699.jpg',
  ],
  'KQ2H08-G03G': [
    'https://www.smcusa.com/images/products/lg/KQ2H.jpg',
    'https://content2.smcetech.com/img/products/KQ2H/KQ2H_main.jpg',
    'https://www.tsisolutions.us/ecomm_images/items/large/kq2h08-g03g.jpg',
    'https://www.doskee.com/wp-content/uploads/2024/02/D15000100133652_1056x1024_1.jpg',
  ],
};

async function downloadImage(urls: string[]): Promise<Buffer | null> {
  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.startsWith('image/')) {
          const buf = Buffer.from(await res.arrayBuffer());
          if (buf.length > 2000) {
            console.log(`    Downloaded: ${url}`);
            return buf;
          }
        }
      }
    } catch {}
  }
  return null;
}

async function processImageBuffer(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer);
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

  for (const [ref, urls] of Object.entries(TARGETED_URLS)) {
    console.log(`\n[${ref}]`);

    // Find the recambio in DB
    const result = await pool.request()
      .input('ref', sql.NVarChar(50), ref.trim())
      .query(`SELECT id, referenciaCMH, imagen FROM Recambios WHERE referenciaCMH = @ref`);
    
    if (result.recordset.length === 0) {
      console.log(`    Not found in DB`);
      continue;
    }

    const recambio = result.recordset[0];
    console.log(`    DB ID: ${recambio.id}, Current image: ${(recambio.imagen || '').substring(0, 60)}`);

    const buffer = await downloadImage(urls);
    if (!buffer) {
      console.log(`    No unique image found, keeping current`);
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
}

main().catch(console.error);
