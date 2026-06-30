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

  const result = await pool.request().query<{ id: number; referenciaCMH: string; imagen: string }>(`
    SELECT id, referenciaCMH, imagen
    FROM Recambios
    WHERE imagen IS NOT NULL AND imagen LIKE '%ferreteriastorageacc%'
    ORDER BY id
  `);
  const recambios = result.recordset;
  console.log(`Found ${recambios.length} recambios with Azure images.`);

  let ok = 0;
  let errors: string[] = [];

  for (const r of recambios) {
    process.stdout.write(`[${ok + errors.length + 1}/${recambios.length}] ${r.referenciaCMH} ... `);
    try {
      const buf = await fetchImage(r.imagen);
      const padded = await addPadding(buf);
      const newUrl = await uploadToAzure(padded, r.referenciaCMH);
      await pool.request()
        .input('imagen', sql.NVarChar(500), newUrl)
        .input('id', sql.Int, r.id)
        .query('UPDATE Recambios SET imagen = @imagen, updatedAt = SYSUTCDATETIME() WHERE id = @id');
      console.log(`OK`);
      ok++;
    } catch (err: any) {
      console.log(`ERROR: ${err.message}`);
      errors.push(`${r.referenciaCMH}: ${err.message}`);
    }
  }

  console.log('\n========== SUMMARY ==========');
  console.log(`Total:     ${recambios.length}`);
  console.log(`OK:        ${ok}`);
  console.log(`Errors:    ${errors.length}`);
  if (errors.length > 0) {
    for (const e of errors) console.error(`  - ${e}`);
  }
  console.log('=============================');
  await pool.close();
}

main().catch(console.error);
