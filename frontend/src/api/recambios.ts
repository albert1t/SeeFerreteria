import { apiFetch, BASE_URL } from './client';
import type { Pedido, Recambio, RecambioFormData, RecambioPreview } from '../types';

export function searchRecambios(busqueda: string, incluirOcultos = false) {
  const params = new URLSearchParams({ busqueda });
  if (incluirOcultos) params.set('incluirOcultos', 'true');
  return apiFetch<Recambio[]>(`/api/recambios?${params}`);
}

export function getPreviewRecambios(incluirOcultos = false) {
  const params = new URLSearchParams({ preview: 'true' });
  if (incluirOcultos) params.set('incluirOcultos', 'true');
  return apiFetch<RecambioPreview[]>(`/api/recambios?${params}`);
}

export function getAllRecambios() {
  return apiFetch<Recambio[]>('/api/recambios?incluirOcultos=true');
}

export function getRecambio(id: number) {
  return apiFetch<Recambio & { pedidos: Pedido[] }>(`/api/recambios/${id}`);
}

export function getRecambioByRef(ref: string) {
  return apiFetch<Recambio>(`/api/recambios/ref/${encodeURIComponent(ref)}`);
}

export function createRecambio(data: RecambioFormData) {
  return apiFetch<Recambio>('/api/recambios', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateRecambio(id: number, data: Partial<RecambioFormData>) {
  return apiFetch<Recambio>(`/api/recambios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function toggleOculto(id: number) {
  return apiFetch<Recambio>(`/api/recambios/${id}/oculto`, { method: 'PATCH' });
}

export function deleteRecambio(id: number) {
  return apiFetch<{ ok: boolean }>(`/api/recambios/${id}`, { method: 'DELETE' });
}

/**
 * Sube una imagen al backend, que la reenvía a Azure Blob Storage
 * dentro de la carpeta "product-image/".
 * Devuelve la URL pública del blob guardado.
 */
export async function uploadImagen(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('imagen', file);

  const res = await fetch(`${BASE_URL}/api/recambios/upload-imagen`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || 'Error al subir imagen');
  }

  return res.json();
}

export function swapRecambios(id1: number, id2: number) {
  return apiFetch<{ r1: Recambio; r2: Recambio }>('/api/recambios/swap', {
    method: 'POST',
    body: JSON.stringify({ id1, id2 }),
  });
}

export async function importarExcel(file: File): Promise<{ total: number, insertados: number, errores: any[] }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/api/recambios/import`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || 'Error al importar Excel');
  }

  return res.json();
}
