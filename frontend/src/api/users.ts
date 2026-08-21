import { apiFetch } from './client';
import type { User, AllowedEmail, UserRole } from '../types';

export function getUsers() {
  return apiFetch<{ users: User[] }>('/api/users');
}

export function createUser(data: { username: string; password: string; name: string; role: UserRole }) {
  return apiFetch<{ ok: boolean }>('/api/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateUserRole(id: number, role: UserRole) {
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

export function getAllowedEmails() {
  return apiFetch<{ emails: AllowedEmail[] }>('/api/users/allowed-emails');
}

export function createAllowedEmail(email: string, role: UserRole) {
  return apiFetch<{ ok: boolean }>('/api/users/allowed-emails', {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  });
}

export function updateAllowedEmail(id: number, role: UserRole, isActive: boolean) {
  return apiFetch<{ ok: boolean }>(`/api/users/allowed-emails/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ role, isActive }),
  });
}

export function deleteUser(id: number) {
  return apiFetch<{ ok: boolean }>(`/api/users/${id}`, {
    method: 'DELETE',
  });
}

export function deleteAllowedEmail(id: number) {
  return apiFetch<{ ok: boolean }>(`/api/users/allowed-emails/${id}`, {
    method: 'DELETE',
  });
}
