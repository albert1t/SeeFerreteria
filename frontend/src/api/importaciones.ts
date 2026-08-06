import { apiFetch, BASE_URL } from './client';
import type { ImportacionCatalogo, ImportacionStatusResponse } from '../types';

export function getImportacionStatus(marca: string): Promise<ImportacionStatusResponse> {
  return apiFetch(`/api/catalogos/importar/${encodeURIComponent(marca)}/estado`);
}

export async function importarCatalogo(
  marca: string,
  file: File,
): Promise<{ ok: boolean; importacion: ImportacionCatalogo }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/api/catalogos/importar/${encodeURIComponent(marca)}`, {
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
