import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { WheelEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { Modal } from '../components/Modal';
import { FichaTecnica } from '../components/FichaTecnica';
import { useToast } from '../components/Toast';
import { btnStyle } from '../styles/theme';
import * as panelesApi from '../api/paneles';
import * as recambiosApi from '../api/recambios';
import * as panelesFrontApi from '../api/paneles';
import * as catalogosApi from '../api/catalogos';
import type { Recambio } from '../types';
import { EmptySlot, NoImageSlot } from '../components/PlaceholderImage';

function LoadingOverlay({ message }: { message: string }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, border: '3px solid rgba(77,184,255,0.2)',
        borderTopColor: '#4db8ff', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <div style={{ color: '#edf2fb', fontSize: 14, fontWeight: 600 }}>{message}</div>
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
        backgroundColor: filled ? 'rgba(26,110,196,0.20)' : 'rgba(255,255,255,0.03)',
        backgroundImage: background,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        border: filled ? '1px solid rgba(77,184,255,0.4)' : '1px solid rgba(255,255,255,0.06)',
        boxShadow: filled && image ? 'inset 0 0 0 1px rgba(255,255,255,0.12)' : undefined,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        containerType: 'size',
      }}
    >
      {filled && !image && (
        <img
          src="/icons/screw.svg"
          alt=""
          style={{
            width: '70%',
            height: '70%',
            objectFit: 'contain',
            filter: 'brightness(0) invert(1) drop-shadow(0 1px 1px rgba(0,0,0,0.4))',
          }}
        />
      )}
      {!filled && (
        <span style={{
          color: 'rgba(255,255,255,0.35)',
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
  setCrearRecambio: Dispatch<SetStateAction<boolean>>;
}

export function AlmacenPage() {
  const { panelSeleccionado, setPanelSeleccionado, setCrearRecambio } = useOutletContext<AlmacenOutletContext>();
  const { can } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [mostrarOcultos, setMostrarOcultos] = useState(false);
  const [fichaAbierta, setFichaAbierta] = useState<Recambio | null>(null);
  const [swapMode, setSwapMode] = useState(false);
  const [selectedForSwap, setSelectedForSwap] = useState<Recambio | null>(null);
  const [confirmSwap, setConfirmSwap] = useState<{ r1: Recambio; r2: Recambio } | null>(null);
  const [showPanelPicker, setShowPanelPicker] = useState(false);
  const [pickPanelName, setPickPanelName] = useState<string | null>(null);
  const [targetPanelCubetas, setTargetPanelCubetas] = useState<any[]>([]);
  const [loadingPickPanel, setLoadingPickPanel] = useState(false);
  const [swapLoading, setSwapLoading] = useState<'swap' | 'move' | null>(null);

  useEffect(() => {
    if (!swapLoading) return;
    const t = setTimeout(() => {
      setSwapLoading(null);
      showToast('La operación está tardando demasiado, inténtalo de nuevo', 'error');
    }, 15000);
    return () => clearTimeout(t);
  }, [swapLoading]);
  const panelListRef = useRef<HTMLDivElement | null>(null);

  const { data: panelesRaw = [], isLoading: loadingPaneles } = useQuery({
    queryKey: ['paneles'],
    queryFn: panelesApi.getPaneles,
  });

  const { data: previewRecambios = [], isLoading: loadingPreview } = useQuery({
    queryKey: ['paneles', 'preview'],
    queryFn: () => recambiosApi.searchRecambios(''),
  });

  const { data: cubetasData, isLoading: loadingCubetas } = useQuery({
    queryKey: ['paneles', panelSeleccionado, 'cubetas', mostrarOcultos],
    queryFn: () => panelesApi.getCubetasPanel(panelSeleccionado!, mostrarOcultos),
    enabled: !!panelSeleccionado,
  });

  const paneles = [...panelesRaw].sort((a, b) =>
    a.panel.localeCompare(b.panel, undefined, { numeric: true, sensitivity: 'base' })
  );

  const cubetas = cubetasData?.cubetas ?? [];

  const { data: familias = [], isLoading: loadingCatalogos } = useQuery({
    queryKey: ['catalogos', 'familias'],
    queryFn: catalogosApi.getFamilias,
  });

  type PanelTitleOption = { kind: 'familia'; id: number; label: string };
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
    return familias.map<PanelTitleOption>((familia) => ({
      kind: 'familia',
      id: familia.id,
      label: familia.nombre,
    }));
  }, [familias]);

  const panelPreviewMap = useMemo(() => {
    const map = new Map<string, Recambio[]>();
    previewRecambios.forEach((recambio) => {
      const panel = recambio.panel.toUpperCase();
      const current = map.get(panel) ?? [];
      current.push(recambio);
      map.set(panel, current);
    });
    return map;
  }, [previewRecambios]);

  const loadingPanelSummary = loadingPaneles || loadingPreview || loadingCatalogos;

  useEffect(() => {
    window.localStorage.setItem('panelTitles', JSON.stringify(panelTitles));
  }, [panelTitles]);

  function getDefaultPanelTitle(panel: string) {
    const items = panelPreviewMap.get(panel) ?? [];
    if (!items.length) return 'Vacío';

    const grouped = items.reduce<Record<string, number>>((acc, item) => {
      const label = item.familiaNombre || 'Sin familia';
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    const best = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0];
    return best ? best[0] : items[0].familiaNombre ?? 'Sin datos';
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

  function getRecambioEnCubeta(col: number, row: number): Recambio | undefined {
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
      {swapLoading && <LoadingOverlay message={swapLoading === 'swap' ? 'Intercambiando posiciones...' : 'Moviendo recambio...'} />}
      <div className="almacen-page-root" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', padding: '1.5rem', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div className="almacen-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexShrink: 0 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {panelSeleccionado ? `Panel ${panelSeleccionado}` : 'Almacén — Vista General'}
            {!panelSeleccionado && can('recambios', 'create') && (
              <button type="button" style={{ ...btnStyle('primary'), fontSize: 13, padding: '6px 12px' }} onClick={() => setCrearRecambio(true)}>
                + Nuevo Recambio
              </button>
            )}
          </h2>
          {can('recambios', 'edit') && panelSeleccionado && (
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
              background: 'rgba(232,168,77,0.08)',
              border: '1px solid rgba(232,168,77,0.25)',
              borderRadius: 8,
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}>
              {!selectedForSwap ? (
                <span style={{ color: '#e8a84d' }}>Haz clic en un recambio para moverlo o intercambiarlo</span>
              ) : (
                <>
                  <span style={{ color: '#e8a84d', fontWeight: 600 }}>
                    {selectedForSwap.referenciaCMH}
                    <span style={{ fontWeight: 400, opacity: 0.6, marginLeft: 6 }}>
                      (P: {selectedForSwap.panel} · C: {selectedForSwap.col} · F: {selectedForSwap.row})
                    </span>
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>→</span>
                  <button
                    style={{ ...btnStyle('primary'), fontSize: 11, padding: '4px 10px' }}
                    onClick={() => setShowPanelPicker(true)}
                    title="Elige panel y posición de destino"
                  >
                    Mover a otro panel
                  </button>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>ó</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Haz clic en otro recambio del mismo panel para intercambiarlo</span>
                  <button style={{ ...btnStyle('ghost'), fontSize: 10, padding: '2px 8px', marginLeft: 'auto' }} onClick={() => setSelectedForSwap(null)}>
                    Cancelar
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        {panelSeleccionado && (
          <button style={btnStyle('ghost')} onClick={() => { setPanelSeleccionado(null); setSwapMode(false); setSelectedForSwap(null); }}>← Volver</button>
        )}
      </div>

      {loadingPanelSummary ? (
        <div style={{ textAlign: 'center', color: '#4a7aaa', padding: '3rem' }}>Cargando paneles...</div>
      ) : !panelSeleccionado ? (
        <>
            <div ref={panelListRef} className="scrollbar-horizontal" style={{ flex: 1, minHeight: 0, overflowX: 'auto', overflowY: 'hidden', paddingBottom: '1rem' }} onWheel={handlePanelListWheel}>
            <div style={{ display: 'flex', gap: '0.75rem', minWidth: 'max-content', alignItems: 'stretch', height: '100%', minHeight: 0 }}>
              {paneles.map((p) => {
                const dims = getPanelDimensions(p.panel);
                const cardWidth = dims.cols === 6 ? 400 : 320;
                const isA1toA5 = (dims.cols === 4 && dims.rows === 8);
                const isA6toA9 = (dims.cols === 5 && dims.rows === 10);
                const miniGap = isA1toA5 ? 4 : isA6toA9 ? 0.75 : 1.5;
                return (
                  <div
                    key={p.panel}
                    onClick={() => setPanelSeleccionado(p.panel)}
                    style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(77,184,255,0.15)',
                      borderRadius: 10, padding: '0.6rem', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
                      minWidth: cardWidth, width: cardWidth, minHeight: 0, display: 'flex', flexDirection: 'column',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(77,184,255,0.4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(77,184,255,0.15)'; }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, textAlign: 'center', width: '100%', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#4db8ff' }}>{p.panel}</div>
                      </div>
                      {editingPanel === p.panel ? (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <select
                            value={panelTitles[p.panel] ? JSON.stringify(panelTitles[p.panel]) : ''}
                            onChange={(e) => handlePanelTitleChange(p.panel, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              width: '100%', border: '1px solid rgba(77,184,255,0.3)', borderRadius: 6, padding: '6px 8px',
                              background: 'rgba(255,255,255,0.05)', color: '#edf2fb', fontSize: 12,
                            }}
                          >
                            <option value="">-- Seleccionar familia --</option>
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
                          className="panel-familia-label"
                          onClick={(e) => { e.stopPropagation(); setEditingPanel(p.panel); }}
                          style={{
                            fontSize: 11,
                            color: '#f3f6ff',
                            opacity: 0.86,
                            minHeight: 24,
                            padding: '6px 8px',
                            borderRadius: 6,
                            background: 'rgba(255,255,255,0.05)',
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
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${dims.cols}, 1fr)`, gridAutoRows: '1fr', gap: miniGap, flex: 1, minHeight: 0, height: '100%' }}>
                      {Array.from({ length: dims.total }, (_, i) => {
                        const col = (i % dims.cols) + 1;
                        const row = Math.floor(i / dims.cols) + 1;
                        const recambio = panelPreviewMap.get(p.panel)?.find((item) => item.col === col && item.row === row);
                        return (
                          <CubetaMini
                            key={i}
                            filled={Boolean(recambio)}
                            image={recambio?.imagen}
                            title={recambio ? `${recambio.referenciaCMH} · C${col}F${row}` : `Vacío C${col}F${row}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p style={{ color: '#4a7aaa', fontSize: 12, marginTop: '1rem', textAlign: 'center' }}>Haz clic en un panel para ver en detalle</p>
        </>
      ) : loadingCubetas ? (
        <div style={{ textAlign: 'center', color: '#4a7aaa', padding: '3rem' }}>Cargando cubetas...</div>
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
                                await recambiosApi.updateRecambio(selectedForSwap.id, { panel: panelSeleccionado!, col, row });
                                showToast(`Movido a C${col}F${row}`, 'success');
                                setSelectedForSwap(null);
                                setSwapMode(false);
                                queryClient.invalidateQueries({ queryKey: ['paneles'] });
                              } catch (err: any) {
                                showToast(err.message, 'error');
                              } finally {
                                setSwapLoading(null);
                              }
                            }
                          } else if (r) {
                            setFichaAbierta(r);
                          }
                        }}
                        className="panel-detail-cell"
                        style={{
                          background: r ? (r.oculto ? 'rgba(196, 26, 26, 0.10)' : 'rgba(26,110,196,0.12)') : 'rgba(255,255,255,0.02)',
                          border: selectedForSwap?.id === r?.id ? '2px solid #f0c040' : r ? (r.oculto ? '1px dashed rgba(196, 26, 26, 0.45)' : '1px solid rgba(77,184,255,0.35)') : '1px dashed rgba(255,255,255,0.08)',
                          opacity: r?.oculto ? 0.84 : 1,
                          borderRadius: 12, padding: '0.75rem', cursor: r ? 'pointer' : (swapMode && selectedForSwap ? 'pointer' : 'default'),
                          minHeight: 210, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                          transition: 'all 0.2s',
                          boxSizing: 'border-box',
                          boxShadow: selectedForSwap?.id === r?.id ? '0 0 12px rgba(240,192,64,0.5)' : undefined,
                        }}
                        onMouseEnter={(e) => {
                          if (r) {
                            e.currentTarget.style.background = 'rgba(26,110,196,0.22)'; e.currentTarget.style.borderColor = '#4db8ff';
                          } else if (swapMode && selectedForSwap) {
                            e.currentTarget.style.background = 'rgba(46,204,64,0.12)'; e.currentTarget.style.borderColor = 'rgba(46,204,64,0.4)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (r) {
                            e.currentTarget.style.background = 'rgba(26,110,196,0.12)'; e.currentTarget.style.borderColor = 'rgba(77,184,255,0.35)';
                          } else if (swapMode && selectedForSwap) {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                          }
                        }}
                      >
                        {r ? (
                          <>
                            {r.imagen ? (
                              <img src={r.imagen} alt="" style={{ width: 90, height: 90, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />
                            ) : (
                              <NoImageSlot size={90} />
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%', flex: 1 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#4db8ff', textAlign: 'center', wordBreak: 'break-all' }}>{r.referenciaCMH}</div>
                              {r.referenciaCliente && (
                                <div style={{ fontSize: 11, color: '#e8a84d', fontStyle: 'italic', textAlign: 'center', wordBreak: 'break-all' }}>
                                  {r.referenciaCliente}
                                </div>
                              )}
                              {r.oculto && (
                                <span style={{ fontSize: 10, color: '#c0392b', background: 'rgba(192,57,43,0.12)', padding: '2px 6px', borderRadius: 4, marginTop: 4 }}>
                                  Oculto
                                </span>
                              )}
                              <div style={{
                                fontSize: 12,
                                color: '#e8eef6',
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
                                {r.nombre}
                              </div>
                              <div style={{ fontSize: 10, color: '#4a7aaa', background: 'rgba(77,184,255,0.06)', padding: '2px 6px', borderRadius: 4, marginTop: 'auto' }}>
                                {col}/{row}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 4 }}>
                            <EmptySlot size={64} />
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{col}/{row}</span>
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
            <p style={{ fontSize: 14, color: '#c8ddf0', marginBottom: '1rem' }}>
              Intercambiar posiciones:
            </p>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, color: '#4db8ff' }}>{confirmSwap.r1.referenciaCMH}</div>
              <div style={{ fontSize: 12, color: '#7aade0' }}>P: {confirmSwap.r1.panel} C: {confirmSwap.r1.col} F: {confirmSwap.r1.row} → P: {confirmSwap.r2.panel} C: {confirmSwap.r2.col} F: {confirmSwap.r2.row}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 700, color: '#4db8ff' }}>{confirmSwap.r2.referenciaCMH}</div>
              <div style={{ fontSize: 12, color: '#7aade0' }}>P: {confirmSwap.r2.panel} C: {confirmSwap.r2.col} F: {confirmSwap.r2.row} → P: {confirmSwap.r1.panel} C: {confirmSwap.r1.col} F: {confirmSwap.r1.row}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button style={btnStyle('ghost')} onClick={() => setConfirmSwap(null)}>Cancelar</button>
              <button style={btnStyle('primary')} onClick={async () => {
                setSwapLoading('swap');
                try {
                  await recambiosApi.swapRecambios(confirmSwap.r1.id, confirmSwap.r2.id);
                  showToast('Posiciones intercambiadas', 'success');
                  setConfirmSwap(null);
                  setSelectedForSwap(null);
                  setSwapMode(false);
                  queryClient.invalidateQueries({ queryKey: ['paneles'] });
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

      <Modal open={!!fichaAbierta} onClose={() => setFichaAbierta(null)} title={fichaAbierta ? `Ficha: ${fichaAbierta.referenciaCMH}` : ''} wide>
        {fichaAbierta && (
          <FichaTecnica
            recambio={fichaAbierta}
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
            <span style={{ fontSize: 16, fontWeight: 700, color: '#edf2fb' }}>
              {pickPanelName ? `Elige posición en ${pickPanelName}` : 'Selecciona panel destino'}
            </span>
          </div>

          {!pickPanelName ? (
            /* Panel list */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
              {paneles.map((p) => {
                const dims = getPanelDimensions(p.panel);
                const ocupados = p.totalRecambios ?? 0;
                const total = dims.total;
                return (
                  <button
                    key={p.panel}
                    type="button"
                    onClick={async () => {
                      setPickPanelName(p.panel);
                      setLoadingPickPanel(true);
                      try {
                        const data = await panelesFrontApi.getCubetasPanel(p.panel, true);
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
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(77,184,255,0.15)',
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
              <div style={{ textAlign: 'center', padding: '2rem', color: '#4a7aaa' }}>Cargando panel...</div>
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
                                    showToast('Esa posición ya está ocupada. Usa el intercambio entre recambios del mismo panel.', 'info');
                                  }
                                  return;
                                }
                                setSwapLoading('move');
                                try {
                                  await recambiosApi.updateRecambio(selectedForSwap.id, { panel: pickPanelName, col, row });
                                  showToast(`Movido a ${pickPanelName} C${col}F${row}`, 'success');
                                  setSelectedForSwap(null);
                                  setSwapMode(false);
                                  setShowPanelPicker(false);
                                  setPickPanelName(null);
                                  setTargetPanelCubetas([]);
                                  queryClient.invalidateQueries({ queryKey: ['paneles'] });
                                } catch (err: any) {
                                  showToast(err.message, 'error');
                                } finally {
                                  setSwapLoading(null);
                                }
                              }}
                              title={ocupante ? `${ocupante.referenciaCMH} (ocupado)` : isSelf ? 'Posición actual' : `C${col}F${row} — vacío`}
                              style={{
                                background: isSelf
                                  ? 'rgba(232,168,77,0.25)'
                                  : ocupante
                                    ? 'rgba(77,184,255,0.15)'
                                    : 'rgba(46,204,64,0.08)',
                                border: isSelf
                                  ? '2px solid #e8a84d'
                                  : ocupante
                                    ? '1px solid rgba(77,184,255,0.3)'
                                    : '1px solid rgba(46,204,64,0.2)',
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
                              <span style={{ fontWeight: 600, fontSize: 11, color: isSelf ? '#e8a84d' : ocupante ? '#7aade0' : '#2ecc40' }}>
                                {col}/{row}
                              </span>
                              {ocupante ? (
                                <span style={{ fontSize: 9, color: '#4a7aaa', lineHeight: 1.2, wordBreak: 'break-word' }}>
                                  {ocupante.referenciaCMH}
                                </span>
                              ) : isSelf ? (
                                <span style={{ fontSize: 9, color: '#e8a84d' }}>actual</span>
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
    </div>
    </>
  );
}
