import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { FormRecambio } from '../components/FormRecambio';
import { btnStyle, colors } from '../styles/theme';
import * as recambiosApi from '../api/recambios';
import * as catalogosApi from '../api/catalogos';
import type { Recambio } from '../types';

const FIELDS: { key: keyof Recambio; label: string; width?: number }[] = [
  { key: 'id', label: 'ID', width: 50 },
  { key: 'referenciaCMH', label: 'Ref. CMH', width: 110 },
  { key: 'referenciaCliente', label: 'Ref. Cliente', width: 110 },
  { key: 'codigo', label: 'Código', width: 80 },
  { key: 'nombre', label: 'Nombre', width: 200 },
  { key: 'marca', label: 'Marca', width: 100 },
  { key: 'metrica', label: 'Métrica', width: 80 },
  { key: 'unidadEmbalaje', label: 'Ud. Embalaje', width: 100 },
  { key: 'familiaNombre', label: 'Familia', width: 120 },
  { key: 'nReposicion', label: 'Nº Repos.', width: 80 },
  { key: 'panel', label: 'Panel', width: 60 },
  { key: 'col', label: 'Col', width: 40 },
  { key: 'row', label: 'Row', width: 40 },
  { key: 'oculto', label: 'Oculto', width: 60 },
];

const CELL_STYLES: React.CSSProperties = {
  padding: '4px 8px', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  borderBottom: '1px solid rgba(77,184,255,0.08)', borderRight: '1px solid rgba(77,184,255,0.05)',
};

const INPUT_STYLES: React.CSSProperties = {
  width: '100%', padding: '2px 4px', fontSize: 12, background: 'rgba(0,0,0,0.3)',
  border: '1px solid #4db8ff', borderRadius: 3, color: '#e8eef6', boxSizing: 'border-box', outline: 'none',
};

function cellValue(r: Recambio, key: keyof Recambio): string {
  const v = r[key];
  if (v === null || v === undefined) return '';
  if (typeof v === 'boolean') return '';
  return String(v);
}

export function DatosPage() {
  const { can } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [busqueda, setBusqueda] = useState('');
  const [filtroPanel, setFiltroPanel] = useState('');
  const [filtroFamilia, setFiltroFamilia] = useState<number | ''>('');
  const [filtroOculto, setFiltroOculto] = useState<boolean | null>(null);
  const [showCrear, setShowCrear] = useState(false);
  const [editandoRecambio, setEditandoRecambio] = useState<Recambio | null>(null);
  const [editando, setEditando] = useState<Record<string, string>>({});
  const [celdaActiva, setCeldaActiva] = useState<{ id: number; field: keyof Recambio } | null>(null);

  const puedeEditar = can('recambios', 'edit');
  const puedeCrear = can('recambios', 'create');

  const { data: recambios = [], isLoading } = useQuery({
    queryKey: ['recambios', 'all'],
    queryFn: recambiosApi.getAllRecambios,
  });

  const { data: familias = [] } = useQuery({
    queryKey: ['catalogos', 'familias'],
    queryFn: catalogosApi.getFamilias,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      recambiosApi.updateRecambio(id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recambios', 'all'] });
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => recambiosApi.deleteRecambio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recambios', 'all'] });
      showToast('Recambio eliminado', 'success');
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const filtrados = useMemo(() => {
    return recambios.filter((r) => {
      if (busqueda) {
        const q = busqueda.toLowerCase();
        const match = [r.referenciaCMH, r.referenciaCliente, r.codigo, r.nombre, r.marca, r.descripcion, r.metrica, r.unidadEmbalaje, r.panel, String(r.col), String(r.row), r.familiaNombre, r.plazoEntrega]
          .some((v) => v && v.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (filtroPanel) {
        if (r.panel.toUpperCase() !== filtroPanel.toUpperCase()) return false;
      }
      if (filtroFamilia !== '') {
        if (r.familiaId !== filtroFamilia) return false;
      }
      if (filtroOculto !== null) {
        if (r.oculto !== filtroOculto) return false;
      }
      return true;
    });
  }, [recambios, busqueda, filtroPanel, filtroFamilia, filtroOculto]);

  function iniciarEdicion(id: number, field: keyof Recambio, currentValue: string) {
    setEditando((prev) => ({ ...prev, [`${id}_${String(field)}`]: currentValue }));
    setCeldaActiva({ id, field });
  }

  const guardarCelda = useCallback((id: number, field: keyof Recambio) => {
    const key = `${id}_${String(field)}`;
    const nuevoValor = editando[key];
    if (nuevoValor === undefined) return;

    const original = recambios.find((r) => r.id === id);
    if (!original) return;

    const valorOriginal = cellValue(original, field);
    if (nuevoValor === valorOriginal) {
      setEditando((prev) => { const n = { ...prev }; delete n[key]; return n; });
      setCeldaActiva(null);
      return;
    }

    let parsed: unknown = nuevoValor;
    if (field === 'col' || field === 'row' || field === 'nReposicion') {
      parsed = nuevoValor === '' ? null : parseInt(nuevoValor, 10);
    } else if (field === 'id') return;

    updateMut.mutate({ id, data: { [field]: parsed } });
    setEditando((prev) => { const n = { ...prev }; delete n[key]; return n; });
    setCeldaActiva(null);
  }, [editando, recambios, updateMut]);

  function handleKeyDown(e: React.KeyboardEvent, id: number, field: keyof Recambio) {
    if (e.key === 'Enter') {
      guardarCelda(id, field);
    } else if (e.key === 'Escape') {
      setEditando((prev) => { const n = { ...prev }; delete n[`${id}_${String(field)}`]; return n; });
      setCeldaActiva(null);
    }
  }

  function renderCell(r: Recambio, field: keyof Recambio) {
    const isEditing = celdaActiva?.id === r.id && celdaActiva?.field === field;
    const key = `${r.id}_${String(field)}`;

    if (field === 'oculto') {
      return (
        <input type="checkbox" checked={r.oculto} disabled={!puedeEditar}
          onChange={() => updateMut.mutate({ id: r.id, data: { oculto: !r.oculto } })} />
      );
    }

    if (field === 'familiaNombre') {
      if (isEditing && puedeEditar) {
        return (
          <select value={editando[key] ?? String(r.familiaId)} onChange={(e) => setEditando((p) => ({ ...p, [key]: e.target.value }))}
            onBlur={() => guardarCelda(r.id, 'familiaId')} onKeyDown={(e) => handleKeyDown(e, r.id, 'familiaId')} autoFocus style={INPUT_STYLES}>
            {familias.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}
          </select>
        );
      }
      return (
        <span onClick={() => puedeEditar && iniciarEdicion(r.id, 'familiaId', String(r.familiaId))}
          style={{ cursor: puedeEditar ? 'pointer' : 'default' }}>
          {r.familiaNombre || '—'}
        </span>
      );
    }

    if (field === 'id') {
      return <span style={{ color: colors.textMuted }}>{r.id}</span>;
    }

    if (field === 'nReposicion') {
      const v = r.nReposicion;
      if (isEditing && puedeEditar) {
        return (
          <input type="number" min={1} value={editando[key] ?? v ?? ''} autoFocus style={INPUT_STYLES}
            onChange={(e) => setEditando((p) => ({ ...p, [key]: e.target.value }))}
            onBlur={() => guardarCelda(r.id, field)} onKeyDown={(e) => handleKeyDown(e, r.id, field)} />
        );
      }
      return <span onClick={() => puedeEditar && iniciarEdicion(r.id, field, String(v ?? ''))}
        style={{ cursor: puedeEditar ? 'pointer' : 'default' }}>{v ?? '—'}</span>;
    }

    if (field === 'col' || field === 'row') {
      const v = r[field];
      if (isEditing && puedeEditar) {
        return (
          <input type="number" min={1} max={field === 'col' ? 6 : 15} value={editando[key] ?? v} autoFocus style={INPUT_STYLES}
            onChange={(e) => setEditando((p) => ({ ...p, [key]: e.target.value }))}
            onBlur={() => guardarCelda(r.id, field)} onKeyDown={(e) => handleKeyDown(e, r.id, field)} />
        );
      }
      return <span onClick={() => puedeEditar && iniciarEdicion(r.id, field, String(v))}
        style={{ cursor: puedeEditar ? 'pointer' : 'default' }}>{v}</span>;
    }

    const v = r[field];
    const display = v ?? '';
    if (isEditing && puedeEditar) {
      return (
        <input value={editando[key] ?? display} autoFocus style={INPUT_STYLES}
          onChange={(e) => setEditando((p) => ({ ...p, [key]: e.target.value }))}
          onBlur={() => guardarCelda(r.id, field)} onKeyDown={(e) => handleKeyDown(e, r.id, field)} />
      );
    }
    return <span onClick={() => puedeEditar && iniciarEdicion(r.id, field, String(v ?? ''))}
      style={{ cursor: puedeEditar ? 'pointer' : 'default' }}>{display || '—'}</span>;
  }

  return (
    <div style={{ padding: '1.5rem', color: colors.text, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexShrink: 0, gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Base de Datos</h2>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <input placeholder="Buscar en todos los campos..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              style={{ padding: '5px 8px', borderRadius: 4, background: 'rgba(0,0,0,0.25)', color: colors.text, border: `1px solid ${colors.border}`, fontSize: 12, width: 220 }} />
            <select value={filtroPanel} onChange={(e) => setFiltroPanel(e.target.value)}
              style={{ padding: '5px 8px', borderRadius: 4, background: 'rgba(0,0,0,0.25)', color: colors.text, border: `1px solid ${colors.border}`, fontSize: 12 }}>
              <option value="">Todos los paneles</option>
              {Array.from({ length: 25 }, (_, i) => `A${i + 1}`).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select value={filtroFamilia} onChange={(e) => setFiltroFamilia(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              style={{ padding: '5px 8px', borderRadius: 4, background: 'rgba(0,0,0,0.25)', color: colors.text, border: `1px solid ${colors.border}`, fontSize: 12 }}>
              <option value="">Todas las familias</option>
              {familias.map((f) => (
                <option key={f.id} value={f.id}>{f.nombre}</option>
              ))}
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: colors.textMuted, cursor: 'pointer' }}>
              <input type="checkbox" checked={filtroOculto === true} onChange={(e) => setFiltroOculto(e.target.checked ? true : null)}
                style={{ accentColor: '#4db8ff' }} />
              Solo ocultos
            </label>
            {(busqueda || filtroPanel || filtroFamilia !== '' || filtroOculto !== null) && (
              <button type="button" onClick={() => { setBusqueda(''); setFiltroPanel(''); setFiltroFamilia(''); setFiltroOculto(null); }}
                style={{ ...btnStyle('ghost'), fontSize: 11, padding: '3px 8px', color: '#ff6b6b' }}>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
        {puedeCrear && (
          <button type="button" style={{ ...btnStyle('primary'), fontSize: 13, padding: '6px 12px', whiteSpace: 'nowrap' }} onClick={() => setShowCrear(true)}>
            + Añadir
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflow: 'auto', border: `1px solid ${colors.border}`, borderRadius: 8, background: colors.bgCard }}>
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: colors.textMuted }}>Cargando datos...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ position: 'sticky', top: 0, background: '#0a1628', zIndex: 1 }}>
                {FIELDS.map((f) => (
                  <th key={String(f.key)} style={{ padding: '8px', fontSize: 11, color: '#7aade0', fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap', borderBottom: `1px solid ${colors.border}`, minWidth: f.width }}>
                    {f.label}
                  </th>
                ))}
                {puedeEditar && (
                  <th style={{ padding: '8px', fontSize: 11, color: '#7aade0', fontWeight: 600, borderBottom: `1px solid ${colors.border}`, minWidth: 60 }}>Acción</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((r) => (
                <tr key={r.id} style={{ background: r.oculto ? 'rgba(255,100,100,0.04)' : undefined }}>
                  {FIELDS.map((f) => (
                    <td key={String(f.key)} style={CELL_STYLES}>{renderCell(r, f.key)}</td>
                  ))}
                  {puedeEditar && (
                    <td style={{ ...CELL_STYLES, display: 'flex', gap: 4 }}>
                      <button type="button" style={{ ...btnStyle('primary'), fontSize: 11, padding: '2px 6px' }}
                        onClick={() => setEditandoRecambio(r)}>
                        Editar
                      </button>
                      <button type="button" style={{ ...btnStyle('danger'), fontSize: 11, padding: '2px 6px' }}
                        disabled={deleteMut.isPending} onClick={() => { if (window.confirm(`¿Eliminar ${r.referenciaCMH}?`)) deleteMut.mutate(r.id); }}>
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={FIELDS.length + (puedeEditar ? 1 : 0)} style={{ padding: '2rem', textAlign: 'center', color: colors.textMuted }}>Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showCrear && (
        <Modal open onClose={() => setShowCrear(false)} title="Nuevo recambio" wide>
          <FormRecambio
            onCancel={() => setShowCrear(false)}
            onSave={() => { setShowCrear(false); queryClient.invalidateQueries({ queryKey: ['recambios', 'all'] }); }}
          />
        </Modal>
      )}

      {editandoRecambio && (
        <Modal open onClose={() => setEditandoRecambio(null)} title={`Editar ${editandoRecambio.referenciaCMH}`} wide>
          <FormRecambio
            recambio={editandoRecambio}
            onCancel={() => setEditandoRecambio(null)}
            onSave={() => {
              setEditandoRecambio(null);
              queryClient.invalidateQueries({ queryKey: ['recambios', 'all'] });
            }}
          />
        </Modal>
      )}
    </div>
  );
}
