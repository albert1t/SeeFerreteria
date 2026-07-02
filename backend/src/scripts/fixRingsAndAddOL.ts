import { getPool, sql } from '../config/db.js';
import { env } from '../config/env.js';
import sharp from 'sharp';

const FRAME_SIZE = 400;
// Smaller ring so it's not too large inside the white canvas
const RING_RADIUS = 75;
const RING_STROKE = 40;

async function generateRingImage(): Promise<Buffer> {
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
    <circle cx="${FRAME_SIZE / 2}" cy="${FRAME_SIZE / 2}" r="${RING_RADIUS}" fill="none" stroke="url(#ringGrad)" stroke-width="${RING_STROKE}" filter="url(#shadow)"/>
  </svg>`;

  return sharp(Buffer.from(svg))
    .resize(FRAME_SIZE, FRAME_SIZE)
    .jpeg({ quality: 85 })
    .toBuffer();
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

const OL_RINGS = [
  { ref: 'OL-M5', row: 5, metric: 'M5', partNo: '34634', desc: 'Anillo de junta para rosca M5' },
  { ref: 'OL-M7', row: 6, metric: 'M7', partNo: '8153155', desc: 'Anillo de junta para rosca M7' },
  { ref: 'OL-1/8', row: 7, metric: 'G1/8', partNo: '33840', desc: 'Anillo de junta para rosca 1/8"' },
  { ref: 'OL-1/4', row: 8, metric: 'G1/4', partNo: '34635', desc: 'Anillo de junta para rosca 1/4"' },
  { ref: 'OL-3/8', row: 9, metric: 'G3/8', partNo: '34636', desc: 'Anillo de junta para rosca 3/8"' },
  { ref: 'OL-1', row: 10, metric: 'G1', partNo: '8153156', desc: 'Anillo de junta para rosca 1"' },
];

async function main() {
  const pool = await getPool();
  let familiaId = 10; // Neumatica

  console.log('=== GENERANDO IMAGEN SVG DEL ANILLO (VERSIÓN REDUCIDA) ===');
  const ringBuffer = await generateRingImage();
  console.log(`Imagen generada: ${ringBuffer.length} bytes (radio=${RING_RADIUS}, stroke=${RING_STROKE})\n`);

  // Step 1: Update existing OK rings (A6 C1 F1-F4) with smaller ring image
  console.log('=== ACTUALIZANDO ANILLOS OK (F1-F4) ===');
  const okResult = await pool.request()
    .query(`SELECT id, referenciaCMH, imagen FROM Recambios WHERE panel = 'A6' AND col = 1 AND [row] BETWEEN 1 AND 4 ORDER BY [row]`);
  const okRings = okResult.recordset;
  console.log(`Encontrados ${okRings.length} anillos OK\n`);

  for (const r of okRings) {
    console.log(`[${r.referenciaCMH}] ID=${r.id}`);
    const url = await uploadToAzure(ringBuffer, r.referenciaCMH);
    await pool.request()
      .input('imagen', sql.NVarChar(500), url)
      .input('id', sql.Int, r.id)
      .query('UPDATE Recambios SET imagen = @imagen, updatedAt = SYSUTCDATETIME() WHERE id = @id');
    console.log(`  -> ${url}\n`);
  }

  // Step 2: Insert OL rings at A6 C1 F5-F10
  console.log('=== INSERTANDO ANILLOS OL (F5-F10) ===');
  for (const ring of OL_RINGS) {
    // Check if already exists
    const existing = await pool.request()
      .input('ref', ring.ref)
      .query(`SELECT id FROM Recambios WHERE referenciaCMH = @ref`);
    if (existing.recordset.length > 0) {
      console.log(`  ${ring.ref} YA EXISTE (ID ${existing.recordset[0].id}) — saltando`);
      continue;
    }

    // Upload a unique image for each (same SVG but each gets its own blob)
    const imgUrl = await uploadToAzure(ringBuffer, ring.ref);

    await pool.request()
      .input('ref', sql.NVarChar(50), ring.ref)
      .input('nombre', sql.NVarChar(100), 'Anillo de junta')
      .input('marca', sql.NVarChar(50), 'Festo')
      .input('referenciaCliente', sql.NVarChar(50), ring.partNo)
      .input('descripcion', sql.NVarChar(500), ring.desc)
      .input('metrica', sql.NVarChar(50), ring.metric)
      .input('unidadEmbalaje', sql.NVarChar(50), '1')
      .input('familiaId', sql.Int, familiaId)
      .input('panel', sql.NVarChar(10), 'A6')
      .input('col', sql.TinyInt, 1)
      .input('row', sql.TinyInt, ring.row)
      .input('imagen', sql.NVarChar(500), imgUrl)
      .input('oculto', sql.Bit, false)
      .query(`
        INSERT INTO Recambios (referenciaCMH, nombre, marca, referenciaCliente, descripcion, metrica, unidadEmbalaje, familiaId, panel, col, [row], imagen, oculto, createdAt, updatedAt)
        VALUES (@ref, @nombre, @marca, @referenciaCliente, @descripcion, @metrica, @unidadEmbalaje, @familiaId, @panel, @col, @row, @imagen, @oculto, SYSUTCDATETIME(), SYSUTCDATETIME())
      `);
    console.log(`  ${ring.ref} insertado en A6 C1F${ring.row} -> ${imgUrl}\n`);
  }

  // Verify
  console.log('=== VERIFICACIÓN A6 C1 ===');
  const verify = await pool.request()
    .query(`SELECT id, referenciaCMH, nombre, panel, col, [row] FROM Recambios WHERE panel = 'A6' AND col = 1 AND [row] BETWEEN 1 AND 10 ORDER BY [row]`);
  for (const v of verify.recordset) {
    console.log(`  F${v.row}: id=${v.id} ref="${v.referenciaCMH}"`);
  }

  await pool.close();
  console.log('\nDone!');
}

main().catch(console.error);
