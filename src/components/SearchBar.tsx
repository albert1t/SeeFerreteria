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
          background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(77,184,255,0.3)',
          borderRadius: 24, color: '#e8eef6', fontSize: 14, outline: 'none', boxSizing: 'border-box',
        }}

      />
      {debounced.length >= 2 && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, background: '#0f2744',
          border: '1px solid #2a5080', borderRadius: 10, marginTop: 4, zIndex: 200,
          maxHeight: 340, overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}>
          {results.slice(0, 12).map((r) => (
            <div
              key={r.id}
              onClick={() => { onSelect(r); setQ(''); setDebounced(''); }}
              style={{
                padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(42,80,128,0.3)',
                display: 'flex', gap: 10, alignItems: 'center',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(77,184,255,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              {r.imagen && (
                <img src={r.imagen} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
              )}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{r.nombre}</div>
                <div style={{ fontSize: 11, color: '#7aade0' }}>{r.referenciaCMH} · {r.panel}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
