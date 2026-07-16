import type { CSSProperties } from 'react';

export const colors = {
  bg: '#0d1b2e',
  bgCard: 'rgba(255,255,255,0.04)',
  header: 'linear-gradient(135deg, #0f2744 0%, #1a3a5c 100%)',
  border: 'rgba(77,184,255,0.15)',
  borderActive: '#4db8ff',
  accent: '#4db8ff',
  accentDark: '#1a6fc4',
  text: '#e8eef6',
  textMuted: '#7aade0',
  textDim: '#4a7aaa',
  danger: '#c0392b',
  success: '#1a8a4a',
  warning: '#b8860b',
};

export function badgeStyle(type: string): CSSProperties {
  const base: CSSProperties = {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
  };
  const map: Record<string, CSSProperties> = {
    'Solicitud Express': { background: 'rgba(192,57,43,0.25)', color: '#ff6b6b', border: '1px solid rgba(192,57,43,0.5)' },
    'Reposición': { background: 'rgba(26,110,196,0.25)', color: '#4db8ff', border: '1px solid rgba(26,110,196,0.4)' },
    'Solicitud': { background: 'rgba(26,138,74,0.25)', color: '#4dff9b', border: '1px solid rgba(26,138,74,0.4)' },
    'Solicitado': { background: 'rgba(184,134,11,0.2)', color: '#f0c040', border: '1px solid rgba(184,134,11,0.4)' },
    'Pedido realizado': { background: 'rgba(26,110,196,0.2)', color: '#4db8ff', border: '1px solid rgba(26,110,196,0.4)' },
    'Pedido recibido': { background: 'rgba(26,138,74,0.2)', color: '#4dff9b', border: '1px solid rgba(26,138,74,0.4)' },
    'Finalizado': { background: 'rgba(100,100,100,0.2)', color: '#888', border: '1px solid rgba(100,100,100,0.3)' },
    info: { background: 'rgba(77,184,255,0.1)', color: '#4db8ff', border: '1px solid rgba(77,184,255,0.2)' },
    ghost: { background: 'rgba(77,184,255,0.08)', color: '#a8cce8', border: '1px solid rgba(77,184,255,0.2)' },
  };
  return { ...base, ...(map[type] || map.info) };
}

export function btnStyle(variant: 'primary' | 'danger' | 'success' | 'ghost' | 'express' = 'primary'): CSSProperties {
  const base: CSSProperties = {
    padding: '9px 20px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.15s',
  };
  const variants: Record<string, CSSProperties> = {
    primary: { background: colors.accentDark, color: '#fff' },
    danger: { background: colors.danger, color: '#fff' },
    success: { background: colors.success, color: '#fff' },
    express: { background: colors.danger, color: '#fff' },
    ghost: { background: 'transparent', border: '1px solid rgba(77,184,255,0.3)', color: '#a8cce8' },
  };
  return { ...base, ...variants[variant] };
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
