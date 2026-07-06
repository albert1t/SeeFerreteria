import { apiFetch } from './client';
import type { User, AllowedEmail, UserRole, Permissions } from '../types';

export function getUsers() {
  return apiFetch<{ users: User[] }>('/api/users');
}

export function updateUserRoleAndPermissions(
  id: number,
  role: UserRole,
  permissions?: Permissions,
) {
  return apiFetch<{ ok: boolean }>(`/api/users/${id}/permissions`, {
    method: 'PATCH',
    body: JSON.stringify({ role, permissions }),
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

export function createAllowedEmail(
  email: string,
  role: UserRole,
  permissions?: Permissions,
) {
  return apiFetch<{ ok: boolean }>('/api/users/allowed-emails', {
    method: 'POST',
    body: JSON.stringify({ email, role, permissions }),
  });
}

export function updateAllowedEmail(
  id: number,
  role: UserRole,
  isActive: boolean,
  permissions?: Permissions,
) {
  return apiFetch<{ ok: boolean }>(`/api/users/allowed-emails/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ role, isActive, permissions }),
  });
}

export function deleteAllowedEmail(id: number) {
  return apiFetch<{ ok: boolean }>(`/api/users/allowed-emails/${id}`, {
    method: 'DELETE',
  });
}
