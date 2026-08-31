import { useEffect, useMemo, useRef, useState, useCallback, type Dispatch, type SetStateAction } from 'react';
import type { WheelEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { Modal } from '../components/Modal';
import { FichaTecnica } from '../components/FichaTecnica';
import { useToast } from '../components/Toast';
import { ScrewIcon } from '../components/PlaceholderImage';
import { useQrScanner } from '../hooks/useQrScanner';
import { btnStyle } from '../styles/theme';
import * as panelesApi from '../api/panels';
import * as recambiosApi from '../api/products';
import * as catalogosApi from '../api/catalogs';
import type { Product, ProductPreview } from '../types';

function LoadingOverlay({ message }: { message: string }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--overlay-soft)', backdropFilter: 'blur(2px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, border: '3px solid var(--border-input-strong)',
        borderTopColor: 'var(--accent)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <div style={{ color: 'var(--text-bright)', fontSize: 14, fontWeight: 600 }}>{message}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

function CubetaMini({ filled, image, title }: { filled: boolean; image?: string | null; title?: string }) {
  const background = image ? `url(${image})` : undefined;
  return (
    <div
      title={title}
      style={{
        width: '100%', height: '100%', borderRadius: 3,
        backgroundColor: filled ? 'var(--bg-cubeta-filled-2)' : 'var(--bg-cubeta-empty)',
        backgroundImage: background,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        border: filled ? '1px solid var(--border-white-soft)' : '1px solid var(--border-white)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        containerType: 'size',
      }}
    >
      {filled && !image && (
        <ScrewIcon
          style={{
            width: '70%',
            height: '70%',
            color: '#fff',
            filter: 'drop-shadow(0 1px 1px var(--shadow-strong))',
          }}
        />
      )}
      {!filled && (
        <span style={{
          color: 'var(--text-faint)',
          fontSize: 'clamp(7px, 18cqw, 10px)',
          fontWeight: 700,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}>
          Vacío
        </span>
      )}
    </div>
  );
}

function getPanelDimensions(panelName: string) {
  const match = panelName.match(/^A(\d+)$/i);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 5) {
      const cols = 4; const rows = 8;
      return { cols, rows, total: cols * rows };
    }
    if (num >= 6 && num <= 9) {
      const cols = 5; const rows = 10;
      return { cols, rows, total: cols * rows };
    }
  }
  const cols = 6; const rows = 15;
  return { cols, rows, total: cols * rows };
}

interface AlmacenOutletContext {
  panelSeleccionado: string | null;
  setPanelSeleccionado: Dispatch<SetStateAction<string | null>>;
  setCrearRecambio: Dispatch<SetStateAction<false | true | { panel: string; col: number; row: number }>>;
}

function AssignProductModal({ panel, col, row, onClose, onAssigned }: {
  panel: string; col: number; row: number;
  onClose: () => void; onAssigned: () => void;
}) {
  const { showToast } = useToast();
  const [manualRef, setManualRef] = useState('');

  const assignProduct = useCallback(async (ref: string) => {
    const trimmed = ref.trim();
    if (!trimmed) return;
    try {
      const product = await recambiosApi.getRecambioByRef(trimmed);
      await recambiosApi.assignPosition(product.id, panel, col, row);
      showToast(`${product.cmhReference} asignado a ${panel} C${col}F${row}`, 'success');
      onAssigned();
      onClose();
    } catch {
      showToast(`Referencia no encontrada: ${trimmed}`);
    }
  }, [panel, col, row, onAssigned, onClose, showToast]);

  const {
    videoRef,
    cameraState,
    errorMsg,
    startCamera,
  } = useQrScanner({ onScan: assignProduct, cooldownMs: 3000, autoStart: true });

  return (
    <Modal open onClose={onClose} title={`Asignar a ${panel} C${col}F${row}`}>
      <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#000', minHeight: 200, marginBottom: '1rem' }}>
        <video ref={videoRef} style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }} playsInline muted />
        {cameraState === 'active' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ width: 160, height: 160, border: '3px solid rgba(255,255,255,0.7)', borderRadius: 12, boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)' }} />
          </div>
        )}
        {cameraState === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13 }}>Abriendo camara...</div>
        )}
        {cameraState === 'idle' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Preparando camara...</div>
        )}
        {cameraState === 'error' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20, textAlign: 'center' }}>
            <p style={{ color: '#fff', fontSize: 13, margin: 0 }}>{errorMsg}</p>
            <button style={{ ...btnStyle('primary'), fontSize: 12, padding: '6px 16px' }} onClick={() => startCamera()}>Reintentar</button>
          </div>
        )}
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Referencia manual</label>
        <input value={manualRef} onChange={(e) => setManualRef(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && assignProduct(manualRef)}
          placeholder="CMH00001" inputMode="text" autoComplete="off"
          style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: 8, color: 'var(--text)', fontSize: 14 }} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btnStyle('primary')} onClick={() => assignProduct(manualRef)}>Asignar</button>
        <button style={btnStyle('ghost')} onClick={onClose}>Cancelar</button>
      </div>
    </Modal>
  );
}

export function AlmacenPage() {
  const { panelSeleccionado, setPanelSeleccionado, setCrearRecambio } = useOutletContext<AlmacenOutletContext>();
  const { can } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [mostrarOcultos, setMostrarOcultos] = useState(false);
  const [fichaAbierta, setFichaAbierta] = useState<Product | null>(null);
  const [swapMode, setSwapMode] = useState(false);
  const [selectedForSwap, setSelectedForSwap] = useState<Product | null>(null);
  const [confirmSwap, setConfirmSwap] = useState<{ r1: Product; r2: Product } | null>(null);
  const [showPanelPicker, setShowPanelPicker] = useState(false);
  const [pickPanelName, setPickPanelName] = useState<string | null>(null);
  const [targetPanelCubetas, setTargetPanelCubetas] = useState<any[]>([]);
  const [loadingPickPanel, setLoadingPickPanel] = useState(false);
  const [swapLoading, setSwapLoading] = useState<'swap' | 'move' | null>(null);
  const [showFamiliasModal, setShowFamiliasModal] = useState(false);
  const [editandoFamilia, setEditandoFamilia] = useState<{ id: number; name: string; description: string } | null>(null);
  const [newFamilyName, setNuevaFamiliaNombre] = useState('');
  const [nuevaFamiliaDesc, setNuevaFamiliaDesc] = useState('');
  const [emptyCubetaClick, setEmptyCubetaClick] = useState<{ panel: string; col: number; row: number } | null>(null);
  const [assignTarget, setAssignTarget] = useState<{ panel: string; col: number; row: number } | null>(null);

  useEffect(() => {
    if (!swapLoading) return;
    const t = setTimeout(() => {
      setSwapLoading(null);
      showToast('La operación está tardando demasiado, inténtalo de nuevo', 'error');
    }, 15000);
    return () => clearTimeout(t);
  }, [swapLoading]);
  const panelListRef = useRef<HTMLDivElement | null>(null);

  const { data: previewProducts = [], isLoading: loadingPreview } = useQuery({
    queryKey: ['panels', 'preview'],
    queryFn: () => recambiosApi.getPreviewProducts(),
  });

  const panels = useMemo(() => {
    const counts = new Map<string, number>();
    previewProducts.forEach((r) => {
      if (!r.panel) return;
      const p = r.panel.toUpperCase();
      counts.set(p, (counts.get(p) ?? 0) + 1);
    });
    return Array.from({ length: 25 }, (_, i) => {
      const panel = `A${i + 1}`;
      return { panel, totalProducts: counts.get(panel) ?? 0 };
    });
  }, [previewProducts]);

  const { data: cubetasData, isLoading: loadingCubetas } = useQuery({
    queryKey: ['panels', panelSeleccionado, 'cubetas', mostrarOcultos],
    queryFn: () => panelesApi.getCubetasPanel(panelSeleccionado!, mostrarOcultos),
    enabled: !!panelSeleccionado,
  });

  const cubetas = cubetasData?.cubetas ?? [];

  const { data: families = [], isLoading: loadingCatalogos } = useQuery({
    queryKey: ['catalogs', 'families'],
    queryFn: catalogosApi.getFamilies,
  });

  const createFamiliaMut = useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string | null }) => catalogosApi.createFamilia(name, description),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['catalogs', 'families'] }); showToast('Family creada', 'success'); setNuevaFamiliaNombre(''); setNuevaFamiliaDesc(''); },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const updateFamiliaMut = useMutation({
    mutationFn: ({ id, name, description }: { id: number; name: string; description?: string | null }) => catalogosApi.updateFamilia(id, name, description),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['catalogs', 'families'] }); showToast('Family actualizada', 'success'); setEditandoFamilia(null); },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const deleteFamiliaMut = useMutation({
    mutationFn: (id: number) => catalogosApi.deleteFamilia(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['catalogs', 'families'] }); showToast('Family eliminada', 'success'); },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  type PanelTitleOption = { kind: 'family'; id: number; label: string };
  const [panelTitles, setPanelTitles] = useState<Record<string, PanelTitleOption | null>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(window.localStorage.getItem('panelTitles') ?? '{}');
    } catch {
      return {};
    }
  });
  const [editingPanel, setEditingPanel] = useState<string | null>(null);

  const titleOptions = useMemo<PanelTitleOption[]>(() => {
    return families.map<PanelTitleOption>((family) => ({
      kind: 'family',
      id: family.id,
      label: family.name,
    }));
  }, [families]);

  const panelPreviewMap = useMemo(() => {
    const map = new Map<string, ProductPreview[]>();
    previewProducts.forEach((product) => {
      if (!product.panel) return;
      const panel = product.panel.toUpperCase();
      const current = map.get(panel) ?? [];
      current.push(product);
      map.set(panel, current);
    });
    return map;
  }, [previewProducts]);

  const loadingPanelSummary = loadingPreview || loadingCatalogos;

  useEffect(() => {
    window.localStorage.setItem('panelTitles', JSON.stringify(panelTitles));
  }, [panelTitles]);

  function getDefaultPanelTitle(panel: string) {
    const items = panelPreviewMap.get(panel) ?? [];
    if (!items.length) return 'Vacío';

    const grouped = items.reduce<Record<string, number>>((acc, item) => {
      const label = item.familyName || 'Sin family';
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    const best = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0];
    return best ? best[0] : items[0].familyName ?? 'Sin datos';
  }

  function getPanelTitleLabel(panel: string) {
    const selection = panelTitles[panel];
    return selection ? selection.label : getDefaultPanelTitle(panel);
  }

  function handlePanelTitleChange(panel: string, optionValue: string) {
    try {
      const option = JSON.parse(optionValue) as PanelTitleOption | null;
      setPanelTitles((prev) => ({ ...prev, [panel]: option }));
    } catch {
      setPanelTitles((prev) => ({ ...prev, [panel]: null }));
    }
  }

  function getRecambioEnCubeta(col: number, row: number): Product | undefined {
    return cubetas.find((r) => r.col === col && r.row === row);
  }

  function handlePanelListWheel(e: WheelEvent<HTMLDivElement>) {
    if (!panelSeleccionado) {
      e.preventDefault();
      if (panelListRef.current) {
        const scrollAmount = e.deltaX !== 0 ? e.deltaX : e.deltaY;
        panelListRef.current.scrollLeft += scrollAmount;
      }
    }
  }

  return (
    <>
      <Modal open={showFamiliasModal} onClose={() => setShowFamiliasModal(false)} title="Gestión de Familias" wide>
        <div style={{ minWidth: 400 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input value={newFamilyName} onChange={(e) => setNuevaFamiliaNombre(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--bg-input-dark)', color: 'var(--text)', border: '1px solid var(--border-input)' }} />
            </div>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: 12, display: 'block', marginBottom: 4 }}>Descripción</label>
              <input value={nuevaFamiliaDesc} onChange={(e) => setNuevaFamiliaDesc(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--bg-input-dark)', color: 'var(--text)', border: '1px solid var(--border-input)' }} />
            </div>
            <button type="button" disabled={!newFamilyName || createFamiliaMut.isPending}
              style={{ ...btnStyle('primary'), padding: '8px 16px' }}
              onClick={() => createFamiliaMut.mutate({ name: newFamilyName, description: nuevaFamiliaDesc || null })}>
              {createFamiliaMut.isPending ? '...' : 'Añadir'}
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--bg-table-head)' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Nombre</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Descripción</th>
                {can('families', 'delete') && <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {families.map((f) => (
                <tr key={f.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px' }}>
                    {editandoFamilia?.id === f.id ? (
                      <input value={editandoFamilia.name} onChange={(e) => setEditandoFamilia({ ...editandoFamilia, name: e.target.value })}
                        style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--bg-input-dark)', color: 'var(--text)', border: '1px solid var(--border-input)', width: '100%' }} />
                    ) : f.name}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {editandoFamilia?.id === f.id ? (
                      <input value={editandoFamilia.description} onChange={(e) => setEditandoFamilia({ ...editandoFamilia, description: e.target.value })}
                        style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--bg-input-dark)', color: 'var(--text)', border: '1px solid var(--border-input)', width: '100%' }} />
                    ) : (f.description || '—')}
                  </td>
                  {can('families', 'delete') && (
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {editandoFamilia?.id === f.id ? (
                          <>
                            <button type="button" style={btnStyle('primary')} disabled={updateFamiliaMut.isPending || !editandoFamilia.name}
                              onClick={() => updateFamiliaMut.mutate({ id: f.id, name: editandoFamilia.name, description: editandoFamilia.description || null })}>
                              Guardar
                            </button>
                            <button type="button" style={btnStyle('ghost')} onClick={() => setEditandoFamilia(null)}>Cancelar</button>
                          </>
                        ) : (
                          <>
                            {can('families', 'edit') && (
                              <button type="button" style={btnStyle('ghost')} onClick={() => setEditandoFamilia({ id: f.id, name: f.name, description: f.description || '' })}>Editar</button>
                            )}
                            {can('families', 'delete') && (
                              <button type="button" style={btnStyle('danger')} disabled={deleteFamiliaMut.isPending}
                                onClick={() => deleteFamiliaMut.mutate(f.id)}>Eliminar</button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {swapLoading && <LoadingOverlay message={swapLoading === 'swap' ? 'Intercambiando posiciones...' : 'Moviendo producto...'} />}
      <div className="almacen-page-root" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div className="almacen-title-row" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexShrink: 0, gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {panelSeleccionado ? `Panel ${panelSeleccionado}` : 'Almacén — Vista General'}
            {!panelSeleccionado && can('products', 'create') && (
              <button type="button" style={{ ...btnStyle('primary'), fontSize: 13, padding: '6px 12px' }} onClick={() => setCrearRecambio(true)}>
                + Nuevo Producto
              </button>
            )}
            {!panelSeleccionado && can('families', 'edit') && (
              <button type="button" style={{ ...btnStyle('ghost'), fontSize: 13, padding: '6px 12px', marginLeft: 8 }} onClick={() => setShowFamiliasModal(true)}>
                Gestionar families
              </button>
            )}
          </h2>
          {can('products', 'edit') && panelSeleccionado && (
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                style={{ ...btnStyle(mostrarOcultos ? 'primary' : 'ghost'), fontSize: 12 }}
                onClick={() => setMostrarOcultos((prev) => !prev)}
              >
                {mostrarOcultos ? 'Ocultar ocultos' : 'Mostrar ocultos'}
              </button>
              <button
                type="button"
                style={{ ...btnStyle(swapMode ? 'primary' : 'ghost'), fontSize: 12 }}
                onClick={() => { setSwapMode((prev: boolean) => !prev); setSelectedForSwap(null); }}
              >
                {swapMode ? 'Salir intercambio' : 'Intercambiar / Mover'}
              </button>
            </div>
          )}
          {swapMode && (
            <div style={{
              marginTop: 8,
              padding: '8px 12px',
              background: 'var(--bg-warning-soft)',
              border: '1px solid var(--border-warning)',
              borderRadius: 8,
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}>
              {!selectedForSwap ? (
                <span style={{ color: 'var(--warning-alt)' }}>Haz clic en un producto para moverlo o intercambiarlo</span>
              ) : (
                <>
                  <span style={{ color: 'var(--warning-alt)', fontWeight: 600 }}>
                    {selectedForSwap.cmhReference}
                    <span style={{ fontWeight: 400, opacity: 0.6, marginLeft: 6 }}>
                      (P: {selectedForSwap.panel} · C: {selectedForSwap.col} · F: {selectedForSwap.row})
                    </span>
                  </span>
                  <span style={{ color: 'var(--text-faint-2)' }}>→</span>
                  <button
                    style={{ ...btnStyle('primary'), fontSize: 11, padding: '4px 10px' }}
                    onClick={() => setShowPanelPicker(true)}
                    title="Elige panel y posición de destino"
                  >
                    Mover a otro panel
                  </button>
                  <span style={{ color: 'var(--text-faint-2)', fontSize: 11 }}>ó</span>
                  <span style={{ color: 'var(--text-faint-2)' }}>Haz clic en otro producto del mismo panel para intercambiarlo</span>
                  <button style={{ ...btnStyle('ghost'), fontSize: 10, padding: '2px 8px', marginLeft: 'auto' }} onClick={() => setSelectedForSwap(null)}>
                    Cancelar
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        {!panelSeleccionado && (
          <p className="almacen-hint" style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'var(--text-dim)', fontSize: 15, fontWeight: 600,
            margin: 0, textAlign: 'center', whiteSpace: 'nowrap', pointerEvents: 'none',
            maxWidth: 'calc(100% - 240px)',
          }}>
            Haz clic en un panel para ver en detalle
          </p>
        )}
        {panelSeleccionado && (
          <button style={btnStyle('ghost')} onClick={() => { setPanelSeleccionado(null); setSwapMode(false); setSelectedForSwap(null); }}>← Volver</button>
        )}
      </div>

      {loadingPanelSummary ? (
        <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '3rem' }}>Cargando panels...</div>
      ) : !panelSeleccionado ? (
        <>
            <div ref={panelListRef} className="scrollbar-horizontal" style={{ flex: 1, minHeight: 0, overflowX: 'auto', overflowY: 'hidden', paddingBottom: '1rem' }} onWheel={handlePanelListWheel}>
            <div style={{ display: 'flex', gap: '0.75rem', minWidth: 'max-content', alignItems: 'stretch', height: '100%', minHeight: 0 }}>
              {panels.map((p) => {
                const dims = getPanelDimensions(p.panel);
                const cardWidth = dims.cols === 6 ? 400 : 320;
                const isA1toA5 = (dims.cols === 4 && dims.rows === 8);
                const isA6toA9 = (dims.cols === 5 && dims.rows === 10);
                const miniColGap = isA1toA5 ? 6 : isA6toA9 ? 4 : 5;
                const miniRowGap = isA1toA5 ? 4 : isA6toA9 ? 3 : 3;
                return (
                  <div
                    key={p.panel}
                    onClick={() => setPanelSeleccionado(p.panel)}
                    style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '0.6rem', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
                      minWidth: cardWidth, width: cardWidth, minHeight: 0, display: 'flex', flexDirection: 'column',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-accent)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, textAlign: 'center', width: '100%', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{p.panel}</div>
                      </div>
                      {editingPanel === p.panel ? (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <select
                            value={panelTitles[p.panel] ? JSON.stringify(panelTitles[p.panel]) : ''}
                            onChange={(e) => handlePanelTitleChange(p.panel, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              width: '100%', border: '1px solid var(--border-input-strong)', borderRadius: 6, padding: '6px 8px',
                              background: 'var(--bg-input)', color: 'var(--text-bright)', fontSize: 12,
                            }}
                          >
                            <option value="">-- Seleccionar family --</option>
                            {titleOptions.map((option) => (
                              <option key={`${option.kind}-${option.id}`} value={JSON.stringify(option)}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPanel(null);
                            }}
                            style={{
                              ...btnStyle('ghost'),
                              padding: '5px 10px',
                              fontSize: 12,
                              minWidth: 0,
                              height: 28,
                            }}
                          >
                            Listo
                          </button>
                        </div>
                      ) : (
                        <div
                          className="panel-family-label"
                          onClick={(e) => { e.stopPropagation(); setEditingPanel(p.panel); }}
                          style={{
                            fontSize: 11,
                            color: 'var(--text-bright)',
                            opacity: 0.86,
                            minHeight: 24,
                            padding: '6px 8px',
                            borderRadius: 6,
                            background: 'var(--bg-input)',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            minWidth: 0,
                            width: '100%',
                            boxSizing: 'border-box',
                            textAlign: 'center',
                          }}
                        >
                          {getPanelTitleLabel(p.panel)}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${dims.cols}, 1fr)`, gridAutoRows: '1fr', columnGap: miniColGap, rowGap: miniRowGap, flex: 1, minHeight: 0, height: '100%' }}>
                      {Array.from({ length: dims.total }, (_, i) => {
                        const col = (i % dims.cols) + 1;
                        const row = Math.floor(i / dims.cols) + 1;
                        const product = panelPreviewMap.get(p.panel)?.find((item) => item.col === col && item.row === row);
                        return (
                          <CubetaMini
                            key={i}
                            filled={Boolean(product)}
                            image={product?.image}
                            title={product ? `${product.cmhReference} · C${col}F${row}` : `Vacío C${col}F${row}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : loadingCubetas ? (
        <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '3rem' }}>Cargando cubetas...</div>
      ) : (
        (() => {
          const dims = getPanelDimensions(panelSeleccionado);
          const isA1toA5 = (dims.cols === 4 && dims.rows === 8);
          const isA6toA9 = (dims.cols === 5 && dims.rows === 10);
          const gridGap = isA1toA5 ? 6 : isA6toA9 ? 8 : 12;
          return (
            <div style={{ overflowY: 'auto', overflowX: 'hidden', flex: 1, minHeight: 0, paddingBottom: '1rem' }}>
              <div
                className="panel-detail-grid"
                style={{ display: 'grid', gridTemplateColumns: `repeat(${dims.cols}, 1fr)`, gap: gridGap, width: '100%' }}
              >
                {Array.from({ length: dims.rows }, (_, rowIdx) =>
                  Array.from({ length: dims.cols }, (_, colIdx) => {
                    const col = colIdx + 1;
                    const row = rowIdx + 1;
                    const r = getRecambioEnCubeta(col, row);
                    return (
                      <div
                        key={`${col}-${row}`}
                        onClick={async () => {
                          if (swapMode) {
                            if (r) {
                              if (!selectedForSwap) {
                                setSelectedForSwap(r);
                              } else if (selectedForSwap.id === r.id) {
                                setSelectedForSwap(null);
                              } else {
                                setConfirmSwap({ r1: selectedForSwap, r2: r });
                              }
                            } else if (selectedForSwap) {
                              setSwapLoading('move');
                              try {
                                await recambiosApi.updateProduct(selectedForSwap.id, { panel: panelSeleccionado!, col, row });
                                showToast(`Movido a C${col}F${row}`, 'success');
                                setSelectedForSwap(null);
                                setSwapMode(false);
                                queryClient.invalidateQueries({ queryKey: ['panels'] });
                              } catch (err: any) {
                                showToast(err.message, 'error');
                              } finally {
                                setSwapLoading(null);
                              }
                            }
                          } else if (r) {
                            setFichaAbierta(r);
                          } else if (can('products', 'create')) {
                            setEmptyCubetaClick({ panel: panelSeleccionado!, col, row });
                          }
                        }}
                        className="panel-detail-cell"
                        style={{
                          background: r ? (r.hidden ? 'var(--bg-danger-soft)' : 'var(--bg-cubeta-filled-2)') : 'var(--bg-cubeta-empty-detail)',
                          border: selectedForSwap && selectedForSwap.id === r?.id ? '2px solid var(--accent)' : r ? (r.hidden ? '1px dashed var(--border-danger)' : '1px solid var(--border-input-soft)') : '1px solid var(--border-cubeta-empty-detail)',
                          opacity: r?.hidden ? 0.84 : 1,
                          borderRadius: 12, padding: '0.75rem', cursor: r ? 'pointer' : (can('products', 'create') ? 'pointer' : (swapMode && selectedForSwap ? 'pointer' : 'default')),
                          minHeight: 210, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                          transition: 'all 0.2s',
                          boxSizing: 'border-box',
                          boxShadow: selectedForSwap && selectedForSwap.id === r?.id ? '0 0 4px var(--accent)' : undefined,
                        }}
                        onMouseEnter={(e) => {
                          if (r) {
                            e.currentTarget.style.background = r.hidden ? 'var(--bg-danger-hover)' : 'var(--bg-cubeta-hover)';
                            e.currentTarget.style.borderColor = r.hidden ? 'var(--border-danger-strong)' : 'var(--border-input-strong)';
                          } else if (can('products', 'create')) {
                            e.currentTarget.style.background = 'var(--bg-accent-faint)';
                            e.currentTarget.style.borderColor = 'var(--border-accent-soft)';
                          } else if (swapMode && selectedForSwap) {
                            e.currentTarget.style.background = 'var(--bg-cubeta-empty-detail)'; e.currentTarget.style.borderColor = 'var(--border-cubeta-empty-detail)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (r) {
                            e.currentTarget.style.background = r.hidden ? 'var(--bg-danger-soft)' : 'var(--bg-cubeta-filled-2)';
                            e.currentTarget.style.borderColor = r.hidden ? 'var(--border-danger)' : 'var(--border-input-soft)';
                          } else if (can('products', 'create')) {
                            e.currentTarget.style.background = 'var(--bg-cubeta-empty-detail)';
                            e.currentTarget.style.borderColor = 'var(--border-cubeta-empty-detail)';
                          } else if (swapMode && selectedForSwap) {
                            e.currentTarget.style.background = 'var(--bg-cubeta-empty-detail)'; e.currentTarget.style.borderColor = 'var(--border-cubeta-empty-detail)';
                          }
                        }}
                      >
                        {r ? (
                          <>
                            {r.image ? (
                              <img src={r.image} alt="" style={{ width: 90, height: 90, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                            ) : (
                              <ScrewIcon
                                style={{
                                  width: 90, height: 90, borderRadius: 8, flexShrink: 0,
                                  color: '#fff',
                                  filter: 'drop-shadow(0 1px 2px var(--shadow-strong))',
                                }}
                              />
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%', flex: 1 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', textAlign: 'center', wordBreak: 'break-all' }}>{r.cmhReference}</div>
                              {r.customerReference && (
                                <div style={{ fontSize: 11, color: 'var(--warning-alt)', fontStyle: 'italic', textAlign: 'center', wordBreak: 'break-all' }}>
                                  {r.customerReference}
                                </div>
                              )}
                              {r.hidden && (
                                <span style={{ fontSize: 10, color: 'var(--danger)', background: 'var(--bg-danger-soft)', padding: '2px 6px', borderRadius: 4, marginTop: 4 }}>
                                  Oculto
                                </span>
                              )}
                              <div style={{
                                fontSize: 12,
                                color: 'var(--text)',
                                lineHeight: 1.25,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                height: 30,
                                textAlign: 'center',
                                wordBreak: 'break-word',
                                margin: '2px 0'
                              }}>
                                {r.name}
                              </div>
                              <div style={{ fontSize: 10, color: 'var(--text-faint-2)', padding: '2px 6px', borderRadius: 4, marginTop: 'auto' }}>
                                {col}/{row}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 6 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-faint-2)' }}>Vacío</span>
                            <span style={{ fontSize: 11, color: 'var(--text-faint-2)' }}>{col}/{row}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })()
      )}

      <Modal open={!!confirmSwap} onClose={() => setConfirmSwap(null)} title="Confirmar intercambio">
        {confirmSwap && (
          <div>
            <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: '1rem' }}>
              Intercambiar posiciones:
            </p>
            <div style={{ background: 'var(--bg-card-soft)', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{confirmSwap.r1.cmhReference}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>P: {confirmSwap.r1.panel} C: {confirmSwap.r1.col} F: {confirmSwap.r1.row} → P: {confirmSwap.r2.panel} C: {confirmSwap.r2.col} F: {confirmSwap.r2.row}</div>
            </div>
            <div style={{ background: 'var(--bg-card-soft)', borderRadius: 8, padding: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{confirmSwap.r2.cmhReference}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>P: {confirmSwap.r2.panel} C: {confirmSwap.r2.col} F: {confirmSwap.r2.row} → P: {confirmSwap.r1.panel} C: {confirmSwap.r1.col} F: {confirmSwap.r1.row}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button style={btnStyle('ghost')} onClick={() => setConfirmSwap(null)}>Cancelar</button>
              <button style={btnStyle('primary')} onClick={async () => {
                setSwapLoading('swap');
                try {
                  await recambiosApi.swapProducts(confirmSwap.r1.id, confirmSwap.r2.id);
                  showToast('Posiciones intercambiadas', 'success');
                  setConfirmSwap(null);
                  setSelectedForSwap(null);
                  setSwapMode(false);
                  queryClient.invalidateQueries({ queryKey: ['panels'] });
                } catch (err: any) {
                  showToast(err.message, 'error');
                } finally {
                  setSwapLoading(null);
                }
              }}>Intercambiar</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!fichaAbierta} onClose={() => setFichaAbierta(null)} title={fichaAbierta ? `Ficha: ${fichaAbierta.cmhReference}` : ''} wide>
        {fichaAbierta && (
          <FichaTecnica
            product={fichaAbierta}
            onClose={() => setFichaAbierta(null)}
            onUpdated={setFichaAbierta}
          />
        )}
      </Modal>

      {/* Panel picker modal for move-to-panel */}
      <Modal open={showPanelPicker} onClose={() => { setShowPanelPicker(false); setPickPanelName(null); setTargetPanelCubetas([]); }} title="Mover a panel">
        <div style={{ minWidth: 420, maxWidth: 560 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
            {pickPanelName && (
              <button style={{ ...btnStyle('ghost'), fontSize: 12, padding: '2px 8px' }} onClick={() => { setPickPanelName(null); setTargetPanelCubetas([]); }}>
                ← Volver
              </button>
            )}
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-bright)' }}>
              {pickPanelName ? `Elige posición en ${pickPanelName}` : 'Selecciona panel destino'}
            </span>
          </div>

          {!pickPanelName ? (
            /* Panel list */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
              {panels.map((p) => {
                const dims = getPanelDimensions(p.panel);
                const ocupados = p.totalProducts ?? 0;
                const total = dims.total;
                return (
                  <button
                    key={p.panel}
                    type="button"
                    onClick={async () => {
                      setPickPanelName(p.panel);
                      setLoadingPickPanel(true);
                      try {
                        const data = await panelesApi.getCubetasPanel(p.panel, true);
                        setTargetPanelCubetas(data.cubetas);
                      } catch { setTargetPanelCubetas([]); }
                      setLoadingPickPanel(false);
                    }}
                    style={{
                      ...btnStyle('ghost'),
                      flexDirection: 'column',
                      gap: 4,
                      padding: '10px',
                      fontSize: 13,
                      fontWeight: 600,
                      background: 'var(--bg-card-soft)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    <span>{p.panel}</span>
                    <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.6 }}>
                      {p.panel === selectedForSwap?.panel ? '(actual)' : `${ocupados}/${total}`}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Grid view of target panel */
            loadingPickPanel ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>Cargando panel...</div>
            ) : (
              (() => {
                const dims = getPanelDimensions(pickPanelName);
                const curKey = selectedForSwap ? `${selectedForSwap.col},${selectedForSwap.row}` : null;
                const sourcePanel = selectedForSwap?.panel ?? null;
                const samePanel = pickPanelName === sourcePanel;
                return (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${dims.cols}, 1fr)`,
                    gap: 6,
                    maxHeight: 400,
                    overflowY: 'auto',
                    paddingRight: 4,
                  }}>
                    {(() => {
                      const cells: React.ReactElement[] = [];
                      for (let row = 1; row <= dims.rows; row++) {
                        for (let col = 1; col <= dims.cols; col++) {
                          const key = `${col},${row}`;
                          const ocupante = targetPanelCubetas.find(c => c.col === col && c.row === row) || null;
                          const isSelf = key === curKey && samePanel;
                          cells.push(
                            <div
                              key={key}
                              onClick={async () => {
                                if (isSelf || !selectedForSwap) return;
                                if (ocupante) {
                                  if (samePanel) {
                                    setConfirmSwap({ r1: selectedForSwap, r2: ocupante });
                                    setShowPanelPicker(false);
                                    setPickPanelName(null);
                                    setTargetPanelCubetas([]);
                                  } else {
                                    showToast('Esa posición ya está ocupada. Usa el intercambio entre productos del mismo panel.', 'info');
                                  }
                                  return;
                                }
                                setSwapLoading('move');
                                try {
                                  await recambiosApi.updateProduct(selectedForSwap.id, { panel: pickPanelName, col, row });
                                  showToast(`Movido a ${pickPanelName} C${col}F${row}`, 'success');
                                  setSelectedForSwap(null);
                                  setSwapMode(false);
                                  setShowPanelPicker(false);
                                  setPickPanelName(null);
                                  setTargetPanelCubetas([]);
                                  queryClient.invalidateQueries({ queryKey: ['panels'] });
                                } catch (err: any) {
                                  showToast(err.message, 'error');
                                } finally {
                                  setSwapLoading(null);
                                }
                              }}
                              title={ocupante ? `${ocupante.cmhReference} (ocupado)` : isSelf ? 'Posición actual' : `C${col}F${row} — vacío`}
                              style={{
                                background: isSelf
                                  ? 'var(--bg-warning-soft)'
                                  : ocupante
                                    ? 'var(--bg-accent-soft)'
                                    : 'var(--bg-success-soft)',
                                border: isSelf
                                  ? '2px solid var(--warning-alt)'
                                  : ocupante
                                    ? '1px solid var(--border-input-strong)'
                                    : '1px solid var(--border-success)',
                                borderRadius: 6,
                                padding: '6px 4px',
                                textAlign: 'center',
                                fontSize: 10,
                                cursor: isSelf ? 'default' : ocupante && !samePanel ? 'not-allowed' : 'pointer',
                                opacity: isSelf ? 0.7 : 1,
                                minHeight: 48,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                                transition: 'all 0.15s',
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelf && !(ocupante && pickPanelName !== selectedForSwap?.panel)) {
                                  (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.05)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                              }}
                            >
                              <span style={{ fontWeight: 600, fontSize: 11, color: isSelf ? 'var(--warning-alt)' : ocupante ? 'var(--text-muted)' : 'var(--success-soft-text)' }}>
                                {col}/{row}
                              </span>
                              {ocupante ? (
                                <span style={{ fontSize: 9, color: 'var(--text-dim)', lineHeight: 1.2, wordBreak: 'break-word' }}>
                                  {ocupante.cmhReference}
                                </span>
                              ) : isSelf ? (
                                <span style={{ fontSize: 9, color: 'var(--warning-alt)' }}>actual</span>
                              ) : null}
                            </div>
                          );
                        }
                      }
                      return cells;
                    })()}
                  </div>
                );
              })()
            )
          )}
        </div>
      </Modal>

      {/* Empty cubeta click modal */}
      <Modal open={!!emptyCubetaClick} onClose={() => setEmptyCubetaClick(null)} title="Cubeta vacia">
        {emptyCubetaClick && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 300 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>
              {emptyCubetaClick.panel} / Col {emptyCubetaClick.col} / Fila {emptyCubetaClick.row}
            </p>
            <button
              style={{ ...btnStyle('primary'), width: '100%', justifyContent: 'center' }}
              onClick={() => {
                if (emptyCubetaClick) {
                  setCrearRecambio(emptyCubetaClick);
                }
                setEmptyCubetaClick(null);
              }}
            >
              + Nuevo recambio en esta posicion
            </button>
            <button
              style={{ ...btnStyle('ghost'), width: '100%', justifyContent: 'center' }}
              onClick={() => {
                setAssignTarget(emptyCubetaClick);
                setEmptyCubetaClick(null);
              }}
            >
              Asignar recambio existente (escanear QR)
            </button>
            <button
              style={{ ...btnStyle('ghost'), width: '100%', justifyContent: 'center', color: 'var(--text-muted)' }}
              onClick={() => setEmptyCubetaClick(null)}
            >
              Cancelar
            </button>
          </div>
        )}
      </Modal>

      {/* Assign existing product modal */}
      {assignTarget && (
        <AssignProductModal
          panel={assignTarget.panel}
          col={assignTarget.col}
          row={assignTarget.row}
          onClose={() => setAssignTarget(null)}
          onAssigned={() => {
            setAssignTarget(null);
            queryClient.invalidateQueries({ queryKey: ['panels'] });
          }}
        />
      )}
    </div>
    </>
  );
}
