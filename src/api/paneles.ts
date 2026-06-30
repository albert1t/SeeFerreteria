import { apiFetch } from './client';
import type { PanelResumen, Recambio } from '../types';

export function getPaneles() {
  return apiFetch<PanelResumen[]>('/api/paneles');
}

export function getCubetasPanel(panel: string, incluirOcultos = false) {
  const params = new URLSearchParams();
  if (incluirOcultos) params.set('incluirOcultos', 'true');
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<{ panel: string; cubetas: Recambio[] }>(`/api/paneles/${panel}/cubetas${query}`);
}
