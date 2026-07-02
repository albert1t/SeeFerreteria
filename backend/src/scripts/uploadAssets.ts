import { env } from '../config/env.js';
import { readFileSync, readdirSync } from 'fs';
import { resolve, join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ASSETS_DIR = resolve(__dirname, '../../../src/assets');
const ALLOWED = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

async function uploadToAzure(buffer: Buffer, blobName: string, contentType: string): Promise<string> {
  const sasUrl = env.AZURE_BLOB_SAS_URL;
  const [baseUrl, sasToken] = sasUrl.split('?');
  const blobUrl = `${baseUrl}/${blobName}?${sasToken}`;
  const azureRes = await fetch(blobUrl, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': contentType,
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
  const files = readdirSync(ASSETS_DIR).filter(f => ALLOWED.includes(extname(f).toLowerCase()));
  console.log(`Found ${files.length} assets:\n`);

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    const contentType = ext === '.svg' ? 'image/svg+xml' : ext === '.png' ? 'image/png' : `image/${ext.slice(1)}`;
    const buf = readFileSync(join(ASSETS_DIR, file));
    const blobName = `assets/${file}`;
    const url = await uploadToAzure(buf, blobName, contentType);
    console.log(`${file}`);
    console.log(`  Size: ${buf.length} bytes`);
    console.log(`  URL:  ${url}\n`);
  }
}

main().catch(console.error);
