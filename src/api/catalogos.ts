import { apiFetch } from './client';
import type { FamiliaConSubs } from '../types';

export function getFamilias() {
  return apiFetch<FamiliaConSubs[]>('/api/catalogos/familias');
}

export function createFamilia(nombre: string, descripcion?: string | null) {
  return apiFetch<{ ok: boolean }>('/api/catalogos/familias', {
    method: 'POST',
    body: JSON.stringify({ nombre, descripcion }),
  });
}

export function updateFamilia(id: number, nombre: string, descripcion?: string | null) {
  return apiFetch<{ ok: boolean }>(`/api/catalogos/familias/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ nombre, descripcion }),
  });
}

export function deleteFamilia(id: number) {
  return apiFetch<{ ok: boolean }>(`/api/catalogos/familias/${id}`, {
    method: 'DELETE',
  });
}
