import { apiFetch } from './client';
import type { User } from '../types';

export function getUsers() {
  return apiFetch<{ users: User[] }>('/api/users');
}

export function updateUserRole(id: number, role: User['role']) {
  return apiFetch<{ ok: boolean }>(`/api/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export function updateUserActive(id: number, isActive: boolean) {
  return apiFetch<{ ok: boolean }>(`/api/users/${id}/active`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
}
