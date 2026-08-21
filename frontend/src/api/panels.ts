import { apiFetch } from './client';
import type { PanelSummary, Product } from '../types';

export function getPanels() {
  return apiFetch<PanelSummary[]>('/api/panels');
}

export function getCubetasPanel(panel: string, incluirOcultos = false) {
  const params = new URLSearchParams();
  if (incluirOcultos) params.set('incluirOcultos', 'true');
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<{ panel: string; cubetas: Product[] }>(`/api/panels/${panel}/cubetas${query}`);
}
