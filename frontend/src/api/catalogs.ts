import { apiFetch } from './client';
import type { FamilyWithSubs } from '../types';

export function getFamilies() {
  return apiFetch<FamilyWithSubs[]>('/api/catalogs/families');
}

export function createFamilia(name: string, description?: string | null) {
  return apiFetch<{ ok: boolean }>('/api/catalogs/families', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}

export function updateFamilia(id: number, name: string, description?: string | null) {
  return apiFetch<{ ok: boolean }>(`/api/catalogs/families/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name, description }),
  });
}

export function deleteFamilia(id: number) {
  return apiFetch<{ ok: boolean }>(`/api/catalogs/families/${id}`, {
    method: 'DELETE',
  });
}
