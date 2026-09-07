import { getPool, closePool } from '../config/db.js';
import { env } from '../config/env.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRAME_SIZE = 400;
// Cubeta grid cells are wider than tall, and the UI shows the 400x400 canvas with
// object-fit:cover, which crops vertically to match the cell's width. Compact/portrait
// items (nuts, screws, the insert) fill up to ~70% of canvas height when only bounded by
// width, which gets clipped. Bounding height separately (190px = 47.5%) keeps every item's
// vertical extent inside the safe zone, while width can still use up to 300px (75%) for
// naturally elongated items (pins, washers).
const INNER_MAX_W = 280;
const INNER_MAX_H = 150;
const DL_DIR = 'C:\\Users\\thedu\\AppData\\Local\\Temp\\claude\\C--Users-thedu-OneDrive-Escritorio-SEE-Ferreteria\\65127317-32c3-4e33-9e29-2b6aa8953343\\scratchpad\\mcm_dl';

// name (exact match in Products.name) -> local downloaded file
const MAP: Record<string, string> = {
  'Arrandela GROWER W DIN127A Cincado': 'Arrandela_GROWER_W_DIN127A_Cincado.png',
  'Arrandela Plana Ancha ISO7093 200HV Cincado': 'Arrandela_Plana_Ancha_ISO7093_200HV_Cincado.png',
  'Arrandela Plana Normal ISO7089 200HV Cincado': 'Arrandela_Plana_Normal_ISO7089_200HV_Cincado.png',
  'Circlips Exterior DIN 471': 'Circlips_Exterior_DIN_471.png',
  'Circlips Interior DIN 472': 'Circlips_Interior_DIN_472.png',
  'Inserto autorroscante Cincado': 'Inserto_autorroscante_Cincado.png',
  'Pasador cilíndrico DIN 6325': 'Pasador_cil_ndrico_DIN_6325.png',
  'Pasador extraible DIN 7979': 'Pasador_extraible_DIN_7979.png',
  'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado': 'Tornillo_cabeza_cilindrica_Allen_ISO4762_DIN912_8_8_Cincado.png',
  'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado': 'Tornillo_cabeza_c_nica_Allen_ISO10642_DIN7991_10_9_Cincado.png',
  'Tornillo de presión con bola': 'Tornillo_de_presi_n_con_bola.png',
  'Tornillo de presión con tetón': 'Tornillo_de_presi_n_con_tet_n.png',
  'Tuerca Freno DIN985 Cincado': 'Tuerca_Freno_DIN985_Cincado.png',
  'Tuerca Hexagonal ISO4032.8 Cincado': 'Tuerca_Hexagonal_ISO4032_8_Cincado.png',
  'Pasador elástico ISO 8752': 'Pasador_elastico_ISO_8752.png',
};

async function processImage(filepath: string): Promise<Buffer> {
  const image = sharp(filepath);
  const resized = await image
    .resize({ width: INNER_MAX_W, height: INNER_MAX_H, fit: 'inside', withoutEnlargement: false })
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

async function uploadToAzure(buffer: Buffer, slug: string): Promise<string> {
  const sasUrl = env.AZURE_BLOB_SAS_URL;
  const safeName = slug.replace(/[^a-zA-Z0-9-]/g, '-');
  const blobName = `product-image/mcmaster-${safeName}-${Date.now()}.jpg`;
  const [baseUrl, sasToken] = sasUrl.split('?');
  const blobUrl = `${baseUrl}/${blobName}?${sasToken}`;
  const res = await fetch(blobUrl, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': 'image/jpeg',
      'Content-Length': String(buffer.length),
    },
    body: buffer as unknown as BodyInit,
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText);
    throw new Error(`Azure Blob error ${res.status}: ${errorText}`);
  }
  return `${baseUrl}/${blobName}`;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const pool = await getPool();

  let totalUpdated = 0;
  for (const [name, filename] of Object.entries(MAP)) {
    const filepath = path.join(DL_DIR, filename);
    if (!fs.existsSync(filepath)) {
      console.log(`[SKIP] missing local file for "${name}": ${filepath}`);
      continue;
    }

    const [rows]: any[] = await pool.query(
      `SELECT id, cmhReference, panel, image FROM Products
       WHERE name = ? AND panel LIKE 'A_%' AND CAST(SUBSTRING(panel, 2) AS UNSIGNED) BETWEEN 10 AND 25`,
      [name]
    );

    if (rows.length === 0) {
      console.log(`[SKIP] no products found for "${name}"`);
      continue;
    }

    console.log(`\n"${name}" -> ${rows.length} products`);

    if (dryRun) {
      for (const r of rows) console.log(`  would update id=${r.id} ref=${r.cmhReference} panel=${r.panel}`);
      continue;
    }

    const processed = await processImage(filepath);
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const url = await uploadToAzure(processed, slug);
    console.log(`  uploaded -> ${url}`);

    const ids = rows.map((r: any) => r.id);
    const placeholders = ids.map(() => '?').join(',');
    const [result]: any[] = await pool.query(
      `UPDATE Products SET image = ?, updatedAt = NOW() WHERE id IN (${placeholders})`,
      [url, ...ids]
    );
    console.log(`  DB rows updated: ${result.affectedRows}`);
    totalUpdated += result.affectedRows;
  }

  console.log(`\n${dryRun ? 'DRY RUN — ' : ''}Total product rows updated: ${totalUpdated}`);
  await closePool();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
