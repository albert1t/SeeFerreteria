import { apiFetch } from './client';
import type { FamiliaConSubs } from '../types';

export function getFamilias() {
  return apiFetch<FamiliaConSubs[]>('/api/catalogos/familias');
}
