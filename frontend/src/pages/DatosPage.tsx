import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { FormRecambio } from '../components/FormRecambio';
import { btnStyle, colors } from '../styles/theme';
import * as recambiosApi from '../api/products';
import * as catalogosApi from '../api/catalogs';
import type { Product } from '../types';

const FIELDS: { key: keyof Product; label: string; width?: number }[] = [
  { key: 'id', label: 'ID', width: 50 },
  { key: 'cmhReference', label: 'Ref. CMH', width: 110 },
  { key: 'customerReference', label: 'Ref. Cliente', width: 110 },
  { key: 'code', label: 'Código', width: 80 },
  { key: 'name', label: 'Nombre', width: 200 },
  { key: 'brand', label: 'Marca', width: 100 },
  { key: 'metric', label: 'Métrica', width: 80 },
  { key: 'packagingUnit', label: 'Ud. Embalaje', width: 100 },
  { key: 'pvpOrientativo', label: 'Precio', width: 90 },
  { key: 'familyName', label: 'Family', width: 120 },
  { key: 'reorderPoint', label: 'Nº Repos.', width: 80 },
  { key: 'panel', label: 'Panel', width: 60 },
  { key: 'col', label: 'Col', width: 40 },
  { key: 'row', label: 'Row', width: 40 },
  { key: 'hidden', label: 'Oculto', width: 60 },
];

const CELL_STYLES: React.CSSProperties = {
  padding: '4px 8px', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border-soft-2)',
};

const INPUT_CELL: React.CSSProperties = {
  width: '100%', padding: '2px 4px', fontSize: 12, background: 'var(--bg-input-dark)',
  border: '1px solid var(--border-input)', borderRadius: 3, color: 'var(--text)',
  boxSizing: 'border-box', outline: 'none', minHeight: 22,
};

const FILTER_DROPDOWN: React.CSSProperties = {
  position: 'absolute', top: '100%', left: 0, zIndex: 100,
  background: 'var(--bg-elevated-2)', border: '1px solid var(--border-input-strong)',
  borderRadius: 6, padding: 8, minWidth: 200, boxShadow: 'var(--shadow-strong)',
};

function FilterDropdown({ value, onChange, onClose, field, families, sortDir, onSort }: {
  value: string; onChange: (v: string) => void; onClose: () => void;
  field: string; families: { id: number; name: string }[];
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

  const btnBase: React.CSSProperties = { display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', borderRadius: 3, cursor: 'pointer', color: colors.text };

  const sortBtn = (dir: 'asc' | 'desc', label: string) => (
    <button type="button" onClick={() => { onSort(dir); onClose(); }}
      style={{
        ...btnBase, fontSize: 12, padding: '4px 8px',
        background: sortDir === dir ? 'var(--bg-hover-strong)' : 'transparent',
        fontWeight: sortDir === dir ? 600 : 400,
      }}>
      {dir === 'asc' ? '▲' : '▼'} {label}
    </button>
  );

  return (
    <div ref={ref} style={{ ...FILTER_DROPDOWN, display: 'flex', flexDirection: 'column' }}>
      {sortBtn('asc', 'Ordenar A→Z')}
      {sortBtn('desc', 'Ordenar Z→A')}
      {sortDir && (
        <button type="button" onClick={() => { onSort(null); onClose(); }}
          style={{ ...btnBase, fontSize: 11, padding: '3px 8px', color: 'var(--danger-text)' }}>
          Quitar orden
        </button>
      )}
      <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0', paddingTop: 6 }}>
        {field === 'panel' ? (
          <select value={value} onChange={(e) => onChange(e.target.value)}
            style={{ width: '100%', padding: '4px 6px', fontSize: 12, background: 'var(--bg-input-dark-2)', color: 'var(--text)', border: '1px solid var(--border-input-strong)', borderRadius: 3, outline: 'none' }} autoFocus>
            <option value="">Todos los panels</option>
            {Array.from({ length: 25 }, (_, i) => `A${i + 1}`).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        ) : field === 'familyName' ? (
          <select value={value} onChange={(e) => onChange(e.target.value)}
            style={{ width: '100%', padding: '4px 6px', fontSize: 12, background: 'var(--bg-input-dark-2)', color: 'var(--text)', border: '1px solid var(--border-input-strong)', borderRadius: 3, outline: 'none' }} autoFocus>
            <option value="">Todas las families</option>
            {families.map((f) => <option key={f.id} value={f.name}>{f.name}</option>)}
          </select>
        ) : field === 'hidden' ? (
          ['', 'false', 'true'].map((val) => (
            <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0', fontSize: 12, color: colors.text, cursor: 'pointer' }}>
              <input type="radio" name="hidden-filtro" checked={value === val} onChange={() => onChange(val)}
                style={{ accentColor: 'var(--accent)' }} />
              {val === '' ? 'Todos' : val === 'false' ? 'No' : 'Sí'}
            </label>
          ))
        ) : (
          <>
            <input placeholder="Filtrar..." value={value} onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onClose(); if (e.key === 'Escape') onClose(); }}
              style={{ width: '100%', padding: '4px 6px', fontSize: 12, background: 'var(--bg-input-dark-2)', color: 'var(--text)', border: '1px solid var(--border-input-strong)', borderRadius: 3, outline: 'none', boxSizing: 'border-box' }} autoFocus />
            <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>Enter ↵ cerrar</div>
          </>
        )}
      </div>
    </div>
  );
}

function cellValue(r: Product, key: keyof Product): string {
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
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [filterOpen, setFilterOpen] = useState<string | null>(null);
  const [sort, setSort] = useState<SortState>(null);
  const [editMode, setEditMode] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [showCrear, setShowCrear] = useState(false);
  const [editandoRecambio, setEditandoRecambio] = useState<Product | null>(null);
  const [editando, setEditando] = useState<Record<string, string>>({});
  const [celdaActiva, setCeldaActiva] = useState<{ id: number; field: keyof Product } | null>(null);

  const puedeEditar = can('products', 'edit');
  const puedeCrear = can('products', 'create');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: recambiosApi.getAllProducts,
  });

  const { data: families = [] } = useQuery({
    queryKey: ['catalogs', 'families'],
    queryFn: catalogosApi.getFamilies,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      recambiosApi.updateProduct(id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'all'] });
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => recambiosApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'all'] });
      showToast('Product eliminado', 'success');
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const filtradosYOrdenados = useMemo(() => {
    let result = products.filter((r) => {
      if (busqueda) {
        const q = busqueda.toLowerCase();
        const match = [r.cmhReference, r.customerReference, r.code, r.name, r.brand, r.description, r.metric, r.packagingUnit, r.panel, String(r.col), String(r.row), r.familyName, r.deliveryTime]
          .some((v) => v && v.toLowerCase().includes(q));
        if (!match) return false;
      }
      for (const [field, filterVal] of Object.entries(columnFilters)) {
        if (!filterVal) continue;
        if (field === 'hidden') {
          if (r.hidden !== (filterVal === 'true')) return false;
          continue;
        }
        const cellText = cellValue(r, field as keyof Product).toLowerCase();
        if (!cellText.includes(filterVal.toLowerCase())) return false;
      }
      return true;
    });

    if (sort) {
      result = [...result].sort((a, b) => {
        const va = cellValue(a, sort.field as keyof Product).toLowerCase();
        const vb = cellValue(b, sort.field as keyof Product).toLowerCase();
        if (va < vb) return sort.dir === 'asc' ? -1 : 1;
        if (va > vb) return sort.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [products, busqueda, columnFilters, sort]);

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
    products.forEach((r) => {
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
      const field = fieldParts.join('_') as keyof Product;
      const id = parseInt(idStr, 10);
      const original = products.find((r) => r.id === id);
      if (!original) continue;
      const origVal = cellValue(original, field);
      if (newVal === origVal) continue;
      if (field === 'id') continue;

      let parsed: unknown = newVal;
      if (field === 'col' || field === 'row' || field === 'reorderPoint') {
        parsed = newVal === '' ? null : parseInt(newVal, 10);
        if (parsed === null) continue;
      }
      if (field === 'pvpOrientativo') {
        parsed = newVal === '' ? null : parseFloat(newVal);
        if (parsed === null) continue;
      }
      if (field === 'familyName' || field === 'familyId') {
        const fam = families.find((f) => f.name === newVal);
        if (fam) parsed = fam.id;
        else continue;
        if (!changesByRecambio[id]) changesByRecambio[id] = {};
        changesByRecambio[id]['familyId'] = parsed;
        continue;
      }
      if (field === 'hidden') {
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
      showToast(`${saves.length} product(s) updated`, 'success');
      setEditMode(false);
      setEditValues({});
    } catch {
      showToast('Error al guardar cambios', 'error');
    }
  }

  function iniciarEdicion(id: number, field: keyof Product, currentValue: string) {
    setEditando((prev) => ({ ...prev, [`${id}_${String(field)}`]: currentValue }));
    setCeldaActiva({ id, field });
  }

  const guardarCelda = useCallback((id: number, field: keyof Product) => {
    const key = `${id}_${String(field)}`;
    const nuevoValor = editando[key];
    if (nuevoValor === undefined) return;

    const original = products.find((r) => r.id === id);
    if (!original) return;

    const valorOriginal = cellValue(original, field);
    if (nuevoValor === valorOriginal) {
      setEditando((prev) => { const n = { ...prev }; delete n[key]; return n; });
      setCeldaActiva(null);
      return;
    }

    let parsed: unknown = nuevoValor;
    if (field === 'col' || field === 'row' || field === 'reorderPoint') {
      parsed = nuevoValor === '' ? null : parseInt(nuevoValor, 10);
    } else if (field === 'pvpOrientativo') {
      parsed = nuevoValor === '' ? null : parseFloat(nuevoValor);
    } else if (field === 'id') return;

    updateMut.mutate({ id, data: { [field]: parsed } });
    setEditando((prev) => { const n = { ...prev }; delete n[key]; return n; });
    setCeldaActiva(null);
  }, [editando, products, updateMut]);

  function handleKeyDown(e: React.KeyboardEvent, id: number, field: keyof Product) {
    if (e.key === 'Enter') {
      guardarCelda(id, field);
    } else if (e.key === 'Escape') {
      setEditando((prev) => { const n = { ...prev }; delete n[`${id}_${String(field)}`]; return n; });
      setCeldaActiva(null);
    }
  }

  function renderCellValue(r: Product, field: keyof Product) {
    const editKey = `${r.id}_${String(field)}`;
    const value = editValues[editKey] ?? cellValue(r, field);

    if (field === 'id') {
      return <span style={{ color: colors.textMuted }}>{r.id}</span>;
    }

    if (field === 'hidden') {
      return (
        <input type="checkbox" checked={value === 'Sí'}
          onChange={(e) => setEditValues((prev) => ({ ...prev, [editKey]: e.target.checked ? 'Sí' : 'No' }))} />
      );
    }

    if (field === 'familyName') {
      return (
        <select value={value} onChange={(e) => setEditValues((prev) => ({ ...prev, [editKey]: e.target.value }))}
          style={INPUT_CELL}>
          {families.map((f) => <option key={f.id} value={f.name}>{f.name}</option>)}
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

    if (field === 'reorderPoint' || field === 'col' || field === 'row') {
      return (
        <input type="number" min={1} value={value} style={INPUT_CELL}
          onChange={(e) => setEditValues((prev) => ({ ...prev, [editKey]: e.target.value }))} />
      );
    }

    if (field === 'pvpOrientativo') {
      return (
        <input type="number" step="0.01" min={0} value={value} style={INPUT_CELL}
          onChange={(e) => setEditValues((prev) => ({ ...prev, [editKey]: e.target.value }))} />
      );
    }

    return (
      <input value={value} style={INPUT_CELL}
        onChange={(e) => setEditValues((prev) => ({ ...prev, [editKey]: e.target.value }))} />
    );
  }

  function renderCell(r: Product, field: keyof Product) {
    if (editMode && puedeEditar && field !== 'id') {
      return renderCellValue(r, field);
    }

    const isEditing = celdaActiva?.id === r.id && celdaActiva?.field === field;
    const key = `${r.id}_${String(field)}`;

    if (field === 'hidden') {
      return (
        <input type="checkbox" checked={r.hidden} disabled={!puedeEditar}
          onChange={() => updateMut.mutate({ id: r.id, data: { hidden: !r.hidden } })} />
      );
    }

    if (field === 'familyName') {
      if (isEditing && puedeEditar) {
        return (
          <select value={editando[key] ?? String(r.familyId)} onChange={(e) => setEditando((p) => ({ ...p, [key]: e.target.value }))}
            onBlur={() => guardarCelda(r.id, 'familyId')} onKeyDown={(e) => handleKeyDown(e, r.id, 'familyId')} autoFocus style={INPUT_CELL}>
            {families.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        );
      }
      return (
        <span onClick={() => puedeEditar && iniciarEdicion(r.id, 'familyId', String(r.familyId))}
          style={{ cursor: puedeEditar ? 'pointer' : 'default' }}>
          {r.familyName || '—'}
        </span>
      );
    }

    if (field === 'id') {
      return <span style={{ color: colors.textMuted }}>{r.id}</span>;
    }

    if (field === 'reorderPoint') {
      const v = r.reorderPoint;
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

    if (field === 'pvpOrientativo') {
      const v = r.pvpOrientativo;
      if (isEditing && puedeEditar) {
        return (
          <input type="number" step="0.01" min={0} value={editando[key] ?? v ?? ''} autoFocus style={INPUT_CELL}
            onChange={(e) => setEditando((p) => ({ ...p, [key]: e.target.value }))}
            onBlur={() => guardarCelda(r.id, field)} onKeyDown={(e) => handleKeyDown(e, r.id, field)} />
        );
      }
      return <span onClick={() => puedeEditar && iniciarEdicion(r.id, field, String(v ?? ''))}
        style={{ cursor: puedeEditar ? 'pointer' : 'default' }}>{v != null ? `${v.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}` : '—'}</span>;
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
    <div style={{ padding: '1.5rem', color: colors.text, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexShrink: 0, gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Base de Datos</h2>
          {editMode ? (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>🔵 Modo edición — todos los campos editables</span>
              <button type="button" onClick={saveEditMode}
                style={{ ...btnStyle('primary'), fontSize: 12, padding: '4px 12px' }}>
                Guardar cambios
              </button>
              <button type="button" onClick={cancelEditMode}
                style={{ ...btnStyle('ghost'), fontSize: 12, padding: '4px 12px', color: 'var(--danger-text)' }}>
                Cancelar
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <input placeholder="Buscar en todos los campos..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                style={{ padding: '5px 8px', borderRadius: 4, background: 'var(--bg-input-dark)', color: colors.text, border: `1px solid ${colors.border}`, fontSize: 12, width: 220 }} />
              {hasAnyFilter && (
                <button type="button" onClick={clearAllFilters}
                  style={{ ...btnStyle('ghost'), fontSize: 11, padding: '3px 8px', color: 'var(--danger-text)' }}>
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
        {!editMode && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {can('tarifas', 'edit') && (
              <button type="button" style={{ ...btnStyle('ghost'), fontSize: 13, padding: '6px 12px', whiteSpace: 'nowrap' }} onClick={() => navigate('/admin/importar-tarifas-festo')}>
                Tarifa Festo
              </button>
            )}
            {puedeCrear && (
              <button type="button" style={{ ...btnStyle('primary'), fontSize: 13, padding: '6px 12px', whiteSpace: 'nowrap' }} onClick={() => setShowCrear(true)}>
                + Añadir
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflow: 'auto', border: `1px solid ${colors.border}`, borderRadius: 8, background: colors.bgCard }}>
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: colors.textMuted }}>Cargando datos...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ position: 'sticky', top: 0, background: 'var(--bg-elevated-2)', zIndex: 1 }}>
                {FIELDS.map((f) => {
                  const hasFilter = Boolean(columnFilters[String(f.key)]);
                  const isSorted = sort?.field === String(f.key);
                  return (
                    <th key={String(f.key)}
                      style={{
                        padding: '8px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600,
                        textAlign: 'left', whiteSpace: 'nowrap', borderBottom: `1px solid ${colors.border}`,
                        minWidth: f.width, cursor: 'pointer', position: 'relative', userSelect: 'none',
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'space-between' }}
                        onClick={() => handleHeaderClick(String(f.key))}>
                        <span>{f.label}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 9, color: hasFilter || isSorted ? 'var(--accent)' : 'var(--text-faint-2)' }}>
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
                          families={families}
                          sortDir={sort?.field === String(f.key) ? sort.dir : null}
                          onSort={(dir) => handleSort(String(f.key), dir)}
                        />
                      )}
                    </th>
                  );
                })}
                {puedeEditar && !editMode && (
                  <th style={{ padding: '8px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, borderBottom: `1px solid ${colors.border}`, minWidth: 60 }}>Acción</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtradosYOrdenados.map((r) => (
                <tr key={r.id} style={{ background: r.hidden ? 'var(--bg-danger-soft)' : undefined }}>
                  {FIELDS.map((f) => (
                    <td key={String(f.key)} style={{
                      ...CELL_STYLES,
                      background: editMode && f.key !== 'id' ? 'var(--bg-accent-faint)' : undefined,
                    }}>{renderCell(r, f.key)}</td>
                  ))}
                  {puedeEditar && !editMode && (
                    <td style={{ ...CELL_STYLES, display: 'flex', gap: 4 }}>
                      <button type="button" style={{ ...btnStyle('primary'), fontSize: 11, padding: '2px 6px' }}
                        onClick={() => setEditandoRecambio(r)}>
                        Editar
                      </button>
                      <button type="button" style={{ ...btnStyle('danger'), fontSize: 11, padding: '2px 6px' }}
                        disabled={deleteMut.isPending} onClick={() => { if (window.confirm(`¿Eliminar ${r.cmhReference}?`)) deleteMut.mutate(r.id); }}>
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
        <Modal open onClose={() => setShowCrear(false)} title="Nuevo product" wide>
          <FormRecambio
            onCancel={() => setShowCrear(false)}
            onSave={() => { setShowCrear(false); queryClient.invalidateQueries({ queryKey: ['products', 'all'] }); }}
          />
        </Modal>
      )}

      {editandoRecambio && (
        <Modal open onClose={() => setEditandoRecambio(null)} title={`Editar ${editandoRecambio.cmhReference}`} wide>
          <FormRecambio
            product={editandoRecambio}
            onCancel={() => setEditandoRecambio(null)}
            onSave={() => {
              setEditandoRecambio(null);
              queryClient.invalidateQueries({ queryKey: ['products', 'all'] });
            }}
          />
        </Modal>
      )}
    </div>
  );
}