import { apiFetch, BASE_URL } from './client';
import type { CatalogImport, ImportStatusResponse } from '../types';

export function getImportStatus(brand: string): Promise<ImportStatusResponse> {
  return apiFetch(`/api/catalogs/import/${encodeURIComponent(brand)}/status`);
}

export async function importCatalog(
  brand: string,
  file: File,
): Promise<{ ok: boolean; result: CatalogImport }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/api/catalogs/import/${encodeURIComponent(brand)}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || 'Error al importar el catálogo');
  }

  return res.json();
}
