import { readFileSync } from 'fs';
import { resolve } from 'path';
import xlsx from 'xlsx';
import { getPool, sql } from '../config/db.js';
import { env } from '../config/env.js';
import sharp from 'sharp';

const FRAME_SIZE = 400;
const PADDING = 30;

interface ExcelRecambio {
  ref: string;
  sheetName: string;
  col: number;
  row: number;
  nombre: string;
  marca: string | null;
  refCli: string | null;
  codigo: string | null;
}

function normalizeRef(ref: string): string {
  return ref.replace(/\//g, '-').toLowerCase();
}

async function downloadImage(ref: string): Promise<Buffer | null> {
  const norm = normalizeRef(ref);
  const sources = [
    `https://www.tsisolutions.us/ecomm_images/items/large/${norm}.jpg`,
    `https://endevoronline.com/img/p/${norm}.jpg`,
  ];
  for (const url of sources) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.startsWith('image/')) {
          const buf = Buffer.from(await res.arrayBuffer());
          if (buf.length > 1000) return buf;
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
  const padded = await sharp({
    create: { width: FRAME_SIZE + PADDING * 2, height: FRAME_SIZE + PADDING * 2, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .composite([{ input: composite, top: PADDING, left: PADDING }])
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
    headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': 'image/jpeg', 'Content-Length': String(buffer.length) },
    body: buffer as unknown as BodyInit,
  });
  if (!azureRes.ok) throw new Error(`Azure Blob error ${azureRes.status}`);
  return `${baseUrl}/${blobName}`;
}

async function findEmptySpot(pool: any, panel: string, col: number, row: number): Promise<{ col: number; row: number } | null> {
  // Check if the exact position is free
  const check = await pool.request()
    .input('panel', sql.NVarChar(10), panel)
    .input('col', sql.Int, col)
    .input('row', sql.Int, row)
    .query('SELECT id FROM Recambios WHERE panel = @panel AND col = @col AND [row] = @row');
  if (check.recordset.length === 0) return { col, row };

  // Find next free row in same column
  for (let r = 1; r <= 15; r++) {
    const c = await pool.request()
      .input('panel', sql.NVarChar(10), panel)
      .input('col', sql.Int, col)
      .input('row', sql.Int, r)
      .query('SELECT id FROM Recambios WHERE panel = @panel AND col = @col AND [row] = @row');
    if (c.recordset.length === 0) return { col, row: r };
  }
  return null;
}

async function main() {
  const pool = await getPool();
  const excelPath = resolve(process.cwd(), '../Lista materiales.xlsx');
  const workbook = xlsx.read(readFileSync(excelPath), { type: 'buffer' });

  // 1. Parse Excel for the 3 references
  const RECAMBIOS_A_IMPORTAR: ExcelRecambio[] = [];
  const TARGETS = ['GRLZ-1/4-B', 'CPV10-M1H-5JS-M7', 'VFOF-LE-BAH-G18-Q6'];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json<Record<string, any>>(worksheet);
    for (const row of rows) {
      const getVal = (keys: string[]) => {
        for (const key of keys) {
          const match = Object.keys(row).find(k => k.trim().toLowerCase() === key.toLowerCase());
          if (match) return row[match];
        }
        return undefined;
      };
      const ref = getVal(['Referencia CMH', 'Ref CMH', 'Referencia', 'Ref', 'referenciacmh']);
      if (!ref) continue;
      const refStr = String(ref).trim();
      if (TARGETS.includes(refStr)) {
        const col = parseInt(getVal(['Col', 'Columna', 'C']) ?? '1', 10);
        const roww = parseInt(getVal(['Row', 'Fila', 'F']) ?? '1', 10);
        RECAMBIOS_A_IMPORTAR.push({
          ref: refStr,
          sheetName,
          col: isNaN(col) ? 1 : col,
          row: isNaN(roww) ? 1 : roww,
          nombre: String(getVal(['Nombre', 'Descripción', 'Descripcion']) || refStr),
          marca: getVal(['Marca']) ? String(getVal(['Marca'])) : null,
          refCli: getVal(['Referencia Cliente', 'Ref Cliente', 'referenciacliente']) ? String(getVal(['Referencia Cliente', 'Ref Cliente', 'referenciacliente'])) : null,
          codigo: getVal(['Codigo', 'Código']) ? String(getVal(['Codigo', 'Código'])) : null,
        });
      }
    }
  }

  if (RECAMBIOS_A_IMPORTAR.length === 0) {
    console.log('No recambios to import.');
    await pool.close();
    return;
  }

  // Show what we found
  for (const r of RECAMBIOS_A_IMPORTAR) {
    console.log(`Found: ${r.ref} at ${r.sheetName} col=${r.col} row=${r.row} (${r.marca})`);
  }

  // 2. Move conflicting recambios to empty spots
  console.log('\n--- Moving conflicts ---');
  for (const item of RECAMBIOS_A_IMPORTAR) {
    const conflict = await pool.request()
      .input('panel', sql.NVarChar(10), item.sheetName)
      .input('col', sql.Int, item.col)
      .input('row', sql.Int, item.row)
      .query('SELECT id, referenciaCMH FROM Recambios WHERE panel = @panel AND col = @col AND [row] = @row');

    if (conflict.recordset.length > 0) {
      const c = conflict.recordset[0];
      // Find next available row in same panel/col
      let newRow = 1;
      while (newRow <= 15) {
        const occupied = await pool.request()
          .input('panel', sql.NVarChar(10), item.sheetName)
          .input('col', sql.Int, item.col)
          .input('row', sql.Int, newRow)
          .query('SELECT id FROM Recambios WHERE panel = @panel AND col = @col AND [row] = @row');
        if (occupied.recordset.length === 0) break;
        newRow++;
      }
      if (newRow <= 15) {
        await pool.request()
          .input('id', sql.Int, c.id)
          .input('panel', sql.NVarChar(10), item.sheetName)
          .input('col', sql.Int, item.col)
          .input('row', sql.Int, newRow)
          .query('UPDATE Recambios SET panel = @panel, col = @col, [row] = @row, updatedAt = SYSUTCDATETIME() WHERE id = @id');
        console.log(`  Moved ${c.referenciaCMH} (id=${c.id}) from ${item.sheetName},${item.col},${item.row} to row ${newRow}`);
      } else {
        console.log(`  WARN: No empty spot in ${item.sheetName} col=${item.col} for ${c.referenciaCMH}`);
      }
    }
  }

  // 3. Insert the 3 recambios
  console.log('\n--- Inserting recambios ---');
  for (const item of RECAMBIOS_A_IMPORTAR) {
    // Check if already exists
    const existing = await pool.request()
      .input('ref', sql.NVarChar(200), item.ref)
      .query('SELECT id FROM Recambios WHERE referenciaCMH = @ref');
    if (existing.recordset.length > 0) {
      console.log(`  ${item.ref} already exists (id=${existing.recordset[0].id}), skipping`);
      continue;
    }

    try {
      await pool.request()
        .input('referenciaCMH', sql.NVarChar(200), item.ref)
        .input('referenciaCliente', sql.NVarChar(200), item.refCli)
        .input('codigo', sql.NVarChar(100), item.codigo)
        .input('nombre', sql.NVarChar(500), item.nombre)
        .input('marca', sql.NVarChar(100), item.marca)
        .input('panel', sql.NVarChar(10), item.sheetName)
        .input('col', sql.Int, item.col)
        .input('row', sql.Int, item.row)
        .input('familiaId', sql.Int, 1)
        .input('nReposicion', sql.Int, 1)
        .query(`
          INSERT INTO Recambios (referenciaCMH, referenciaCliente, codigo, nombre, marca, panel, col, [row], familiaId, nReposicion, oculto, createdAt, updatedAt)
          VALUES (@referenciaCMH, @referenciaCliente, @codigo, @nombre, @marca, @panel, @col, @row, @familiaId, @nReposicion, 0, SYSUTCDATETIME(), SYSUTCDATETIME())
        `);
      console.log(`  INSERTED ${item.ref} at ${item.sheetName} col=${item.col} row=${item.row}`);
    } catch (err: any) {
      console.error(`  ERROR inserting ${item.ref}: ${err.message}`);
    }
  }

  // 4. Find and upload images for recambios without Azure image
  console.log('\n--- Finding missing images ---');
  const missingImg = await pool.request().query(`
    SELECT id, referenciaCMH, marca FROM Recambios
    WHERE imagen IS NULL OR imagen = '' OR imagen NOT LIKE '%ferreteriastorageacc%'
    ORDER BY id
  `);
  console.log(`Recambios without Azure image: ${missingImg.recordset.length}`);

  for (const r of missingImg.recordset) {
    process.stdout.write(`  [${r.id}] ${r.referenciaCMH} ... `);

    // Try specific TSI URL
    const buf = await downloadImage(r.referenciaCMH);
    if (!buf) {
      console.log('NO IMAGE FOUND');
      continue;
    }

    try {
      const processed = await processImageBuffer(buf);
      const url = await uploadToAzure(processed, r.referenciaCMH);
      await pool.request()
        .input('imagen', sql.NVarChar(500), url)
        .input('id', sql.Int, r.id)
        .query('UPDATE Recambios SET imagen = @imagen, updatedAt = SYSUTCDATETIME() WHERE id = @id');
      console.log(`OK`);
    } catch (err: any) {
      console.log(`ERROR: ${err.message}`);
    }
  }

  console.log('\nDone.');
  await pool.close();
}

main().catch(console.error);
