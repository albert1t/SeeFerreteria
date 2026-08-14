import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as recambiosApi from '../api/recambios';
import type { Recambio } from '../types';

interface SearchBarProps {
  onSelect: (recambio: Recambio) => void;
  placeholder?: string;
}

export function SearchBar({ onSelect, placeholder = 'Buscar por nombre o referencia...' }: SearchBarProps) {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const { data: results = [] } = useQuery({
    queryKey: ['recambios', 'search', debounced],
    queryFn: () => recambiosApi.searchRecambios(debounced),
    enabled: debounced.length >= 1,
  });

  return (
    <div style={{ flex: 1, maxWidth: 400, position: 'relative' }}>
      <span style={{
        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
        fontSize: 16, pointerEvents: 'none', opacity: 0.5,
      }}>
      🔍
      </span>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '8px 40px 8px 16px',
          background: 'var(--bg-input)', border: '1px solid var(--border-input-strong)',
          borderRadius: 24, color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
        }}

      />
      {debounced.length >= 2 && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-elevated)',
          border: '1px solid var(--border-strong)', borderRadius: 10, marginTop: 4, zIndex: 200,
          maxHeight: 340, overflowY: 'auto', boxShadow: '0 10px 30px var(--shadow-strong)',
        }}>
          {results.slice(0, 12).map((r) => (
            <div
              key={r.id}
              onClick={() => { onSelect(r); setQ(''); setDebounced(''); }}
              style={{
                padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border-soft-2)',
                display: 'flex', gap: 10, alignItems: 'center',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              {r.imagen ? (
                <img src={r.imagen} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--bg-card-soft)', border: '1px solid var(--border-white-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--text-dim)', flexShrink: 0 }}>
                  📦
                </div>
              )}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{r.nombre}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.referenciaCMH} · {r.panel}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
