import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
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

const INPUT_CELL: React.CSSProperties = {
  width: '100%', padding: '2px 4px', fontSize: 12, background: 'rgba(0,0,0,0.25)',
  border: '1px solid rgba(77,184,255,0.25)', borderRadius: 3, color: '#e8eef6',
  boxSizing: 'border-box', outline: 'none', minHeight: 22,
};

const FILTER_DROPDOWN: React.CSSProperties = {
  position: 'absolute', top: '100%', left: 0, zIndex: 100,
  background: '#0f1d30', border: '1px solid rgba(77,184,255,0.3)',
  borderRadius: 6, padding: 8, minWidth: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
};

function FilterDropdown({ value, onChange, onClose, field, familias, sortDir, onSort }: {
  value: string; onChange: (v: string) => void; onClose: () => void;
  field: string; familias: { id: number; nombre: string }[];
  sortDir: 'asc' | 'desc' | null; onSort: (dir: 'asc' | 'desc' | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const sortBtn = (dir: 'asc' | 'desc', label: string) => (
    <button type="button" onClick={() => { onSort(dir); onClose(); }}
      style={{
        ...btnStyle('ghost'), fontSize: 12, padding: '4px 8px', textAlign: 'left', width: '100%',
        background: sortDir === dir ? 'rgba(77,184,255,0.15)' : 'transparent',
        fontWeight: sortDir === dir ? 600 : 400,
      }}>
      {dir === 'asc' ? '▲' : '▼'} {label}
    </button>
  );

  return (
    <div ref={ref} style={FILTER_DROPDOWN}>
      {sortBtn('asc', 'Ordenar A→Z')}
      {sortBtn('desc', 'Ordenar Z→A')}
      {sortDir && (
        <button type="button" onClick={() => { onSort(null); onClose(); }}
          style={{ ...btnStyle('ghost'), fontSize: 11, padding: '2px 8px', textAlign: 'left', width: '100%', color: '#ff6b6b' }}>
          Quitar orden
        </button>
      )}
      <div style={{ borderTop: '1px solid rgba(77,184,255,0.15)', margin: '6px 0', paddingTop: 6 }}>
        {field === 'panel' ? (
          <select value={value} onChange={(e) => onChange(e.target.value)}
            style={{ width: '100%', padding: '4px 6px', fontSize: 12, background: 'rgba(0,0,0,0.3)', color: '#e8eef6', border: '1px solid rgba(77,184,255,0.3)', borderRadius: 3, outline: 'none' }} autoFocus>
            <option value="">Todos los paneles</option>
            {Array.from({ length: 25 }, (_, i) => `A${i + 1}`).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        ) : field === 'familiaNombre' ? (
          <select value={value} onChange={(e) => onChange(e.target.value)}
            style={{ width: '100%', padding: '4px 6px', fontSize: 12, background: 'rgba(0,0,0,0.3)', color: '#e8eef6', border: '1px solid rgba(77,184,255,0.3)', borderRadius: 3, outline: 'none' }} autoFocus>
            <option value="">Todas las familias</option>
            {familias.map((f) => <option key={f.id} value={f.nombre}>{f.nombre}</option>)}
          </select>
        ) : field === 'oculto' ? (
          ['', 'false', 'true'].map((val) => (
            <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0', fontSize: 12, color: colors.text, cursor: 'pointer' }}>
              <input type="radio" name="oculto-filtro" checked={value === val} onChange={() => onChange(val)}
                style={{ accentColor: '#4db8ff' }} />
              {val === '' ? 'Todos' : val === 'false' ? 'No' : 'Sí'}
            </label>
          ))
        ) : (
          <>
            <input placeholder="Filtrar..." value={value} onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onClose(); if (e.key === 'Escape') onClose(); }}
              style={{ width: '100%', padding: '4px 6px', fontSize: 12, background: 'rgba(0,0,0,0.3)', color: '#e8eef6', border: '1px solid rgba(77,184,255,0.3)', borderRadius: 3, outline: 'none', boxSizing: 'border-box' }} autoFocus />
            <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>Enter ↵ cerrar</div>
          </>
        )}
      </div>
    </div>
  );
}

function cellValue(r: Recambio, key: keyof Recambio): string {
  const v = r[key];
  if (v === null || v === undefined) return '';
  if (typeof v === 'boolean') return v ? 'Sí' : 'No';
  return String(v);
}

type SortState = { field: string; dir: 'asc' | 'desc' } | null;

export function DatosPage() {
  const { can } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [busqueda, setBusqueda] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [filterOpen, setFilterOpen] = useState<string | null>(null);
  const [sort, setSort] = useState<SortState>(null);
  const [editMode, setEditMode] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
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

  const filtradosYOrdenados = useMemo(() => {
    let result = recambios.filter((r) => {
      if (busqueda) {
        const q = busqueda.toLowerCase();
        const match = [r.referenciaCMH, r.referenciaCliente, r.codigo, r.nombre, r.marca, r.descripcion, r.metrica, r.unidadEmbalaje, r.panel, String(r.col), String(r.row), r.familiaNombre, r.plazoEntrega]
          .some((v) => v && v.toLowerCase().includes(q));
        if (!match) return false;
      }
      for (const [field, filterVal] of Object.entries(columnFilters)) {
        if (!filterVal) continue;
        if (field === 'oculto') {
          if (r.oculto !== (filterVal === 'true')) return false;
          continue;
        }
        const cellText = cellValue(r, field as keyof Recambio).toLowerCase();
        if (!cellText.includes(filterVal.toLowerCase())) return false;
      }
      return true;
    });

    if (sort) {
      result = [...result].sort((a, b) => {
        const va = cellValue(a, sort.field as keyof Recambio).toLowerCase();
        const vb = cellValue(b, sort.field as keyof Recambio).toLowerCase();
        if (va < vb) return sort.dir === 'asc' ? -1 : 1;
        if (va > vb) return sort.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [recambios, busqueda, columnFilters, sort]);

  const hasAnyFilter = busqueda || Object.values(columnFilters).some(Boolean);

  function clearAllFilters() {
    setBusqueda(''); setColumnFilters({}); setSort(null);
  }

  function handleHeaderClick(field: string) {
    setFilterOpen((prev) => prev === field ? null : field);
  }

  function handleSort(field: string, dir: 'asc' | 'desc' | null) {
    if (dir === null) {
      setSort(null);
    } else {
      setSort({ field, dir });
    }
  }

  function enterEditMode() {
    const vals: Record<string, string> = {};
    recambios.forEach((r) => {
      FIELDS.forEach((f) => {
        vals[`${r.id}_${String(f.key)}`] = cellValue(r, f.key);
      });
    });
    setEditValues(vals);
    setEditMode(true);
  }

  function cancelEditMode() {
    setEditValues({});
    setEditMode(false);
  }

  async function saveEditMode() {
    const changesByRecambio: Record<number, Record<string, unknown>> = {};
    for (const [key, newVal] of Object.entries(editValues)) {
      const [idStr, ...fieldParts] = key.split('_');
      const field = fieldParts.join('_') as keyof Recambio;
      const id = parseInt(idStr, 10);
      const original = recambios.find((r) => r.id === id);
      if (!original) continue;
      const origVal = cellValue(original, field);
      if (newVal === origVal) continue;
      if (field === 'id') continue;

      let parsed: unknown = newVal;
      if (field === 'col' || field === 'row' || field === 'nReposicion') {
        parsed = newVal === '' ? null : parseInt(newVal, 10);
        if (parsed === null) continue;
      }
      if (field === 'familiaNombre' || field === 'familiaId') {
        const fam = familias.find((f) => f.nombre === newVal);
        if (fam) parsed = fam.id;
        else continue;
        if (!changesByRecambio[id]) changesByRecambio[id] = {};
        changesByRecambio[id]['familiaId'] = parsed;
        continue;
      }
      if (field === 'oculto') {
        parsed = newVal === 'Sí';
      }

      if (!changesByRecambio[id]) changesByRecambio[id] = {};
      changesByRecambio[id][field] = parsed;
    }

    const ids = Object.keys(changesByRecambio);
    if (ids.length === 0) {
      showToast('Sin cambios', 'success');
      setEditMode(false);
      setEditValues({});
      return;
    }

    const saves = ids.map((id) =>
      updateMut.mutateAsync({ id: parseInt(id, 10), data: changesByRecambio[parseInt(id, 10)] })
    );
    try {
      await Promise.all(saves);
      showToast(`${saves.length} recambio(s) actualizados`, 'success');
      setEditMode(false);
      setEditValues({});
    } catch {
      showToast('Error al guardar cambios', 'error');
    }
  }

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

  function renderCellValue(r: Recambio, field: keyof Recambio) {
    const editKey = `${r.id}_${String(field)}`;
    const value = editValues[editKey] ?? cellValue(r, field);

    if (field === 'id') {
      return <span style={{ color: colors.textMuted }}>{r.id}</span>;
    }

    if (field === 'oculto') {
      return (
        <input type="checkbox" checked={value === 'Sí'}
          onChange={(e) => setEditValues((prev) => ({ ...prev, [editKey]: e.target.checked ? 'Sí' : 'No' }))} />
      );
    }

    if (field === 'familiaNombre') {
      return (
        <select value={value} onChange={(e) => setEditValues((prev) => ({ ...prev, [editKey]: e.target.value }))}
          style={INPUT_CELL}>
          {familias.map((f) => <option key={f.id} value={f.nombre}>{f.nombre}</option>)}
        </select>
      );
    }

    if (field === 'panel') {
      return (
        <select value={value} onChange={(e) => setEditValues((prev) => ({ ...prev, [editKey]: e.target.value }))}
          style={INPUT_CELL}>
          {Array.from({ length: 25 }, (_, i) => `A${i + 1}`).map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      );
    }

    if (field === 'nReposicion' || field === 'col' || field === 'row') {
      return (
        <input type="number" min={1} value={value} style={INPUT_CELL}
          onChange={(e) => setEditValues((prev) => ({ ...prev, [editKey]: e.target.value }))} />
      );
    }

    return (
      <input value={value} style={INPUT_CELL}
        onChange={(e) => setEditValues((prev) => ({ ...prev, [editKey]: e.target.value }))} />
    );
  }

  function renderCell(r: Recambio, field: keyof Recambio) {
    if (editMode && puedeEditar && field !== 'id') {
      return renderCellValue(r, field);
    }

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
            onBlur={() => guardarCelda(r.id, 'familiaId')} onKeyDown={(e) => handleKeyDown(e, r.id, 'familiaId')} autoFocus style={INPUT_CELL}>
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
          <input type="number" min={1} value={editando[key] ?? v ?? ''} autoFocus style={INPUT_CELL}
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
          <input type="number" min={1} max={field === 'col' ? 6 : 15} value={editando[key] ?? v} autoFocus style={INPUT_CELL}
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
        <input value={editando[key] ?? display} autoFocus style={INPUT_CELL}
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
          {editMode ? (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#4db8ff', fontWeight: 600 }}>🔵 Modo edición — todos los campos editables</span>
              <button type="button" onClick={saveEditMode}
                style={{ ...btnStyle('primary'), fontSize: 12, padding: '4px 12px' }}>
                Guardar cambios
              </button>
              <button type="button" onClick={cancelEditMode}
                style={{ ...btnStyle('ghost'), fontSize: 12, padding: '4px 12px', color: '#ff6b6b' }}>
                Cancelar
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <input placeholder="Buscar en todos los campos..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                style={{ padding: '5px 8px', borderRadius: 4, background: 'rgba(0,0,0,0.25)', color: colors.text, border: `1px solid ${colors.border}`, fontSize: 12, width: 220 }} />
              {hasAnyFilter && (
                <button type="button" onClick={clearAllFilters}
                  style={{ ...btnStyle('ghost'), fontSize: 11, padding: '3px 8px', color: '#ff6b6b' }}>
                  Limpiar filtros
                </button>
              )}
              {puedeEditar && (
                <button type="button" onClick={enterEditMode}
                  style={{ ...btnStyle('primary'), fontSize: 12, padding: '4px 12px' }}>
                  ✎ Editar todo
                </button>
              )}
            </div>
          )}
        </div>
        {!editMode && puedeCrear && (
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
                {FIELDS.map((f) => {
                  const hasFilter = Boolean(columnFilters[String(f.key)]);
                  const isSorted = sort?.field === String(f.key);
                  return (
                    <th key={String(f.key)}
                      style={{
                        padding: '8px', fontSize: 11, color: '#7aade0', fontWeight: 600,
                        textAlign: 'left', whiteSpace: 'nowrap', borderBottom: `1px solid ${colors.border}`,
                        minWidth: f.width, cursor: 'pointer', position: 'relative', userSelect: 'none',
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'space-between' }}
                        onClick={() => handleHeaderClick(String(f.key))}>
                        <span>{f.label}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 9, color: hasFilter || isSorted ? '#4db8ff' : 'rgba(122,173,224,0.3)' }}>
                          {isSorted && <span>{sort!.dir === 'asc' ? '▲' : '▼'}</span>}
                          <span>▽</span>
                        </span>
                      </div>
                      {filterOpen === String(f.key) && (
                        <FilterDropdown
                          value={columnFilters[String(f.key)] ?? ''}
                          onChange={(v) => setColumnFilters((prev) => ({ ...prev, [String(f.key)]: v }))}
                          onClose={() => setFilterOpen(null)}
                          field={String(f.key)}
                          familias={familias}
                          sortDir={sort?.field === String(f.key) ? sort.dir : null}
                          onSort={(dir) => handleSort(String(f.key), dir)}
                        />
                      )}
                    </th>
                  );
                })}
                {puedeEditar && !editMode && (
                  <th style={{ padding: '8px', fontSize: 11, color: '#7aade0', fontWeight: 600, borderBottom: `1px solid ${colors.border}`, minWidth: 60 }}>Acción</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtradosYOrdenados.map((r) => (
                <tr key={r.id} style={{ background: r.oculto ? 'rgba(255,100,100,0.04)' : undefined }}>
                  {FIELDS.map((f) => (
                    <td key={String(f.key)} style={{
                      ...CELL_STYLES,
                      background: editMode && f.key !== 'id' ? 'rgba(77,184,255,0.03)' : undefined,
                    }}>{renderCell(r, f.key)}</td>
                  ))}
                  {puedeEditar && !editMode && (
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
              {filtradosYOrdenados.length === 0 && (
                <tr><td colSpan={FIELDS.length + (puedeEditar && !editMode ? 1 : 0)} style={{ padding: '2rem', textAlign: 'center', color: colors.textMuted }}>Sin resultados</td></tr>
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