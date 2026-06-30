import { apiFetch } from './client';
import type { User } from '../types';

export function login(username: string, password: string) {
  return apiFetch<{ user: User }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function register(username: string, name: string, password: string) {
  return apiFetch<{ user: User }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, name, password }),
  });
}

export function loginMicrosoft(idToken: string) {
  return apiFetch<{ user: User }>('/api/auth/msal-login', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
}

export function logout() {
  return apiFetch<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
}

export function getMe() {
  return apiFetch<{ user: User }>('/api/auth/me');
}
