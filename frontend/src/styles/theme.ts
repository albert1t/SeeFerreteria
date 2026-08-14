import type { CSSProperties } from 'react';

export const colors = {
  bg: 'var(--bg)',
  bgCard: 'var(--bg-card)',
  bgCardSolid: 'var(--bg-card-solid)',
  header: 'var(--header-bg)',
  border: 'var(--border)',
  borderStrong: 'var(--border-strong)',
  borderActive: 'var(--accent)',
  accent: 'var(--accent)',
  accentDark: 'var(--accent-dark)',
  text: 'var(--text)',
  textMuted: 'var(--text-muted)',
  textDim: 'var(--text-dim)',
  textNav: 'var(--text-nav)',
  textLight: 'var(--text-light)',
  textBright: 'var(--text-bright)',
  danger: 'var(--danger)',
  dangerText: 'var(--danger-text)',
  success: 'var(--success)',
  successText: 'var(--success-text)',
  warning: 'var(--warning)',
  warningText: 'var(--warning-text)',
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
    'Solicitud Express': { background: 'rgba(192,57,43,0.25)', color: 'var(--danger-text)', border: '1px solid rgba(192,57,43,0.5)' },
    'Reposición': { background: 'rgba(26,110,196,0.25)', color: 'var(--accent)', border: '1px solid rgba(26,110,196,0.4)' },
    'Solicitud': { background: 'rgba(26,138,74,0.25)', color: 'var(--success-text)', border: '1px solid rgba(26,138,74,0.4)' },
    'Solicitado': { background: 'rgba(184,134,11,0.2)', color: 'var(--warning-text)', border: '1px solid rgba(184,134,11,0.4)' },
    'Pedido realizado': { background: 'rgba(26,110,196,0.2)', color: 'var(--accent)', border: '1px solid rgba(26,110,196,0.4)' },
    'Pedido recibido': { background: 'rgba(26,138,74,0.2)', color: 'var(--success-text)', border: '1px solid rgba(26,138,74,0.4)' },
    'Finalizado': { background: 'rgba(100,100,100,0.2)', color: 'var(--text-muted-2)', border: '1px solid rgba(100,100,100,0.3)' },
    info: { background: 'rgba(77,184,255,0.1)', color: 'var(--accent)', border: '1px solid rgba(77,184,255,0.2)' },
    ghost: { background: 'var(--bg-accent-faint)', color: 'var(--text-nav)', border: '1px solid var(--border-input-soft)' },
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
    primary: { background: 'var(--accent-dark)', color: '#fff' },
    danger: { background: 'var(--danger)', color: '#fff' },
    success: { background: 'var(--success)', color: '#fff' },
    express: { background: 'var(--danger)', color: '#fff' },
    ghost: { background: 'transparent', border: '1px solid var(--border-input-strong)', color: 'var(--text-nav)' },
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
