import { apiFetch, BASE_URL } from './client';
import type { Order, Product, ProductFormData, ProductPreview } from '../types';

export function searchProducts(busqueda: string, incluirOcultos = false) {
  const params = new URLSearchParams({ busqueda });
  if (incluirOcultos) params.set('incluirOcultos', 'true');
  return apiFetch<Product[]>(`/api/products?${params}`);
}

export function getPreviewProducts(incluirOcultos = false) {
  const params = new URLSearchParams({ preview: 'true' });
  if (incluirOcultos) params.set('incluirOcultos', 'true');
  return apiFetch<ProductPreview[]>(`/api/products?${params}`);
}

export function getAllProducts() {
  return apiFetch<Product[]>('/api/products?incluirOcultos=true');
}

export function getRecambio(id: number) {
  return apiFetch<Product & { orders: Order[] }>(`/api/products/${id}`);
}

export function getRecambioByRef(ref: string) {
  return apiFetch<Product>(`/api/products/ref/${encodeURIComponent(ref)}`);
}

export function createProduct(data: ProductFormData) {
  return apiFetch<Product>('/api/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateProduct(id: number, data: Partial<ProductFormData>) {
  return apiFetch<Product>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function toggleOculto(id: number) {
  return apiFetch<Product>(`/api/products/${id}/hidden`, { method: 'PATCH' });
}

export function deleteProduct(id: number) {
  return apiFetch<{ ok: boolean }>(`/api/products/${id}`, { method: 'DELETE' });
}

/**
 * Sube una image al backend, que la reenvía a Azure Blob Storage
 * dentro de la carpeta "product-image/".
 * Devuelve la URL pública del blob guardado.
 */
export async function uploadImagen(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${BASE_URL}/api/products/upload-image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || 'Error al subir image');
  }

  return res.json();
}

export function swapProducts(id1: number, id2: number) {
  return apiFetch<{ r1: Product; r2: Product }>('/api/products/swap', {
    method: 'POST',
    body: JSON.stringify({ id1, id2 }),
  });
}

export async function importarExcel(file: File): Promise<{ total: number, insertados: number, errors: any[] }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/api/products/import`, {
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
