import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { badgeStyle, btnStyle, fmtDate } from '../styles/theme';
import { Modal } from './Modal';
import { FormRecambio } from './FormRecambio';
import { useToast } from './Toast';
import { NoImageSlot } from './PlaceholderImage';
import * as recambiosApi from '../api/recambios';
import * as pedidosApi from '../api/pedidos';
import type { PedidoTipo, Recambio } from '../types';

interface FichaTecnicaProps {
  recambio: Recambio;
  onClose: () => void;
  onUpdated?: (r: Recambio) => void;
}

export function FichaTecnica({ recambio, onClose, onUpdated }: FichaTecnicaProps) {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'info' | 'pedidos' | 'nuevo'>('info');
  const [pedidoTipo, setPedidoTipo] = useState<PedidoTipo | null>(null);
  const [cantidad, setCantidad] = useState('');
  const [plazoDeseado, setPlazoDeseado] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [editando, setEditando] = useState(false);
  const [confirmacion, setConfirmacion] = useState<{ tipo: PedidoTipo; cantidad?: number; plazoDeseado?: string; observaciones?: string } | null>(null);
  const fechaRef = useRef<HTMLInputElement>(null);

  function parseEmbalaje(embalaje: string | null | undefined): number {
    if (!embalaje) return 1;
    const match = embalaje.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  }

  const { data: detail } = useQuery({
    queryKey: ['recambios', recambio.id],
    queryFn: () => recambiosApi.getRecambio(recambio.id),
    initialData: { ...recambio, pedidos: [] },
  });

  const createPedidoMut = useMutation({
    mutationFn: pedidosApi.createPedido,
    onSuccess: () => {
      showToast('Pedido creado correctamente', 'success');
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['recambios', recambio.id] });
      setPedidoTipo(null);
      setCantidad('');
      setPlazoDeseado('');
      setObservaciones('');
      setTab('pedidos');
    },
    onError: (err: Error) => showToast(err.message),
  });

  const toggleOcultoMut = useMutation({
    mutationFn: () => recambiosApi.toggleOculto(recambio.id),
    onSuccess: (r) => {
      showToast(r.oculto ? 'Recambio ocultado' : 'Recambio visible', 'success');
      onUpdated?.(r);
      queryClient.invalidateQueries({ queryKey: ['recambios'] });
      queryClient.invalidateQueries({ queryKey: ['paneles'] });
    },
    onError: (err: Error) => showToast(err.message),
  });

  const deleteMut = useMutation({
    mutationFn: () => recambiosApi.deleteRecambio(recambio.id),
    onSuccess: () => {
      showToast('Recambio eliminado', 'success');
      queryClient.invalidateQueries({ queryKey: ['recambios'] });
      queryClient.invalidateQueries({ queryKey: ['paneles'] });
      onClose();
    },
    onError: (err: Error) => showToast(err.message),
  });

  function confirmarCreacion(tipo: PedidoTipo) {
    if (tipo === 'Solicitud' && (!cantidad || !plazoDeseado)) {
      showToast('Indica cantidad y plazo deseado');
      return;
    }
    setConfirmacion({
      tipo,
      cantidad: cantidad ? parseInt(cantidad, 10) : undefined,
      plazoDeseado: plazoDeseado || undefined,
      observaciones: observaciones || undefined,
    });
  }

  function totalPedido(): number {
    const emb = parseEmbalaje(r.unidadEmbalaje);
    if (confirmacion?.tipo === 'Reposición') return (confirmacion?.cantidad ?? r.nReposicion ?? 1) * emb;
    return (confirmacion?.cantidad ?? 0) * emb;
  }

  function ejecutarPedido() {
    if (!confirmacion) return;
    const cantidadTotal = totalPedido();
    createPedidoMut.mutate({
      recambioId: recambio.id,
      tipo: confirmacion.tipo,
      cantidad: cantidadTotal,
      plazoDeseado: confirmacion.plazoDeseado,
      observaciones: confirmacion.observaciones,
    });
    setConfirmacion(null);
  }

  const r = detail;
  const misPedidos = r.pedidos ?? [];
  const pendingOrders = misPedidos.filter(p => p.estado !== 'Finalizado');

  const labelStyle: React.CSSProperties = {
    fontSize: 12, color: '#7aade0', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4, display: 'block',
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {r.imagen ? (
          <img src={r.imagen} alt={r.nombre} style={{ width: 100, height: 100, borderRadius: 10, border: '1px solid #2a5080', objectFit: 'cover' }} />
        ) : (
          <NoImageSlot size={100} style={{ borderRadius: 10, border: '1px solid #2a5080' }} />
        )}
        <div style={{ flex: 1, minWidth: 200 }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700 }}>{r.nombre}</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <span style={badgeStyle('info')}>{r.referenciaCMH}</span>
            {r.marca && <span style={badgeStyle('ghost')}>{r.marca}</span>}
            <span style={badgeStyle('ghost')}>P: {r.panel} · C: {r.col} · F: {r.row}</span>
            {r.oculto && <span style={badgeStyle('Finalizado')}>Oculto</span>}
          </div>
          {r.descripcion && <div style={{ fontSize: 13, color: '#7aade0' }}>{r.descripcion}</div>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', borderBottom: '1px solid rgba(42,80,128,0.5)', paddingBottom: '0.75rem' }}>
        {(['info', 'pedidos', 'nuevo'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              ...btnStyle('ghost'), fontSize: 12, padding: '6px 14px',
              ...(tab === t ? { background: 'rgba(77,184,255,0.15)', borderColor: '#4db8ff', color: '#4db8ff' } : {}),
            }}
          >
            {t === 'info' ? 'Info' : t === 'pedidos' ? `Historial (${misPedidos.length})` : 'Nuevo Pedido'}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div>
          {/* Pending orders banner */}
          {pendingOrders.length > 0 && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(255,165,0,0.1)', border: '1px solid rgba(255,165,0,0.4)', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, color: '#ffa500', marginBottom: 4 }}>Pedidos pendientes</div>
              {pendingOrders.map(p => (
                <div key={p.id} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={badgeStyle(p.tipo)}>{p.tipo}</span>
                    <span style={badgeStyle(p.estado)}>{p.estado}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#7aade0' }}>
                    {fmtDate(p.fechaSolicitud)} · {p.solicitanteNombre} · Qty: {p.cantidad}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Original info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.5rem', marginBottom: '1rem' }}>
            {[
              ['Ref. CMH', r.referenciaCMH],
              ['Ref. Cliente', r.referenciaCliente ?? '—'],
              ['Código', r.codigo ?? '—'],
              ['Marca', r.marca ?? '—'],
              ['Métrica', r.metrica ?? '—'],
              ['Unidad de embalaje', r.unidadEmbalaje ?? '—'],
              ['Plazo de entrega', r.plazoEntrega ?? '—'],
              ['Familia', r.familiaNombre ?? '—'],
              ['N° Reposición', r.nReposicion ?? '—'],
              ['Ubicación', `${r.panel} - Col ${r.col} Fila ${r.row}`],
            ].map(([k, v]) => (
              <div key={k as string}>
                <div style={labelStyle}>{k}</div>
                <div style={{ fontSize: 14, color: '#c8ddf0', fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>

          {isAdmin && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(42,80,128,0.4)' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={btnStyle('ghost')} onClick={() => setEditando(true)}>Editar</button>
                <button style={btnStyle('danger')} onClick={() => { if (confirm('¿Eliminar recambio?')) deleteMut.mutate(); }}>
                  Eliminar
                </button>
              </div>
              <button style={{ ...btnStyle('ghost'), marginLeft: 'auto' }} onClick={() => toggleOcultoMut.mutate()}>
                {r.oculto ? 'Mostrar' : 'Ocultar'}
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'pedidos' && (
        <div>
          {misPedidos.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#4a7aaa', padding: '2rem' }}>Sin historial de pedidos</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...misPedidos].sort((a, b) => new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime()).map((p) => (
                <div key={p.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(42,80,128,0.3)', borderRadius: 8, padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={badgeStyle(p.tipo)}>{p.tipo}</span>
                    <span style={badgeStyle(p.estado)}>{p.estado}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#7aade0' }}>
                    {fmtDate(p.fechaSolicitud)} · {p.solicitanteNombre} · Qty: {p.cantidad}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'nuevo' && (
        <div>
          {!pedidoTipo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ color: '#7aade0', fontSize: 12, margin: '0 0 2px' }}>Selecciona el tipo de pedido:</p>
              {r.unidadEmbalaje && (
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f3f6ff', background: 'rgba(77,184,255,0.15)', border: '1px solid rgba(77,184,255,0.4)', padding: '8px 14px', borderRadius: 8, marginBottom: 6 }}>
                  Ud. embalaje: {r.unidadEmbalaje}
                </div>
              )}
              {([
                { tipo: 'Reposición' as PedidoTipo, label: 'Automático', desc: `${(() => { const paq = r.nReposicion ?? 1; const emb = parseEmbalaje(r.unidadEmbalaje); const total = paq * emb; return emb > 1 ? `${paq} paquetes × ${r.unidadEmbalaje} = ${total} uds` : `${paq} uds`; })()} · Plazo: ${r.plazoEntrega || '—'}`, color: '#4db8ff', bgCard: '#0f2744', borderColor: '#2a5080' },
                { tipo: 'Solicitud' as PedidoTipo, label: 'Personalizado', desc: 'Cantidad y plazo a definir', color: '#4dff9b', bgCard: '#0a2a1a', borderColor: '#1a5a3a' },
                { tipo: 'Solicitud Express' as PedidoTipo, label: 'Urgente', desc: 'Prioritario · entrega inmediata', color: '#ff6b6b', bgCard: '#2a0a0a', borderColor: '#5a2020' },
              ]).map((opt) => (
                <button
                  key={opt.tipo}
                  onClick={() => opt.tipo === 'Reposición' ? confirmarCreacion(opt.tipo) : setPedidoTipo(opt.tipo)}
                  disabled={createPedidoMut.isPending}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: 0,
                    background: opt.bgCard, border: `1px solid ${opt.borderColor}`, borderRadius: 12,
                    cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', width: '100%',
                    opacity: createPedidoMut.isPending ? 0.6 : 1, overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = opt.color; e.currentTarget.style.boxShadow = `0 4px 16px ${opt.color}20`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = opt.borderColor; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'; }}
                >
                  {/* Left accent bar */}
                  <div style={{ width: 4, alignSelf: 'stretch', background: opt.color, flexShrink: 0 }} />
                  {/* Text */}
                  <div style={{ flex: 1, padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#e8eef6' }}>{opt.tipo}</span>
                      <span style={{ fontSize: 10, color: opt.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{opt.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#7aade0', marginTop: 2 }}>{opt.desc}</div>
                  </div>
                  {/* Action chevron */}
                  <div style={{
                    padding: '0 16px', fontSize: 20, color: opt.color, flexShrink: 0, fontWeight: 300,
                  }}>
                    {opt.tipo === 'Reposición' ? '→' : '›'}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={badgeStyle(pedidoTipo)}>{pedidoTipo}</span>
                <button onClick={() => setPedidoTipo(null)} style={{
                  background: 'none', border: 'none', color: '#7aade0', cursor: 'pointer', fontSize: 12,
                  padding: 0, textDecoration: 'underline', textUnderlineOffset: 3,
                }}>
                  Cambiar tipo
                </button>
                {r.unidadEmbalaje && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#f3f6ff', background: 'rgba(77,184,255,0.15)', border: '1px solid rgba(77,184,255,0.4)', padding: '5px 12px', borderRadius: 6, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                    Ud. embalaje: {r.unidadEmbalaje}
                  </span>
                )}
              </div>
              {pedidoTipo !== 'Reposición' && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={labelStyle}>N° paquetes {pedidoTipo === 'Solicitud' ? '*' : ''}</label>
                  <input
                    type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)}
                    placeholder="Ej: 5"
                    style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(77,184,255,0.25)', borderRadius: 8, color: '#e8eef6', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                  {r.unidadEmbalaje && cantidad && !isNaN(parseInt(cantidad, 10)) && (
                    <div style={{ fontSize: 12, color: '#7aade0', marginTop: 4 }}>
                      {parseInt(cantidad, 10)} × {r.unidadEmbalaje} = <strong style={{ color: '#4db8ff' }}>{parseInt(cantidad, 10) * parseEmbalaje(r.unidadEmbalaje)} uds</strong> total
                    </div>
                  )}
                </div>
              )}
              {pedidoTipo === 'Solicitud' && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={labelStyle}>Fecha deseada de entrega *</label>
                  <div
                    onClick={() => fechaRef.current?.showPicker()}
                    style={{ cursor: 'pointer', width: '100%' }}
                  >
                    <input
                      ref={fechaRef}
                      type="date"
                      value={plazoDeseado} onChange={(e) => setPlazoDeseado(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(77,184,255,0.25)', borderRadius: 8, color: '#e8eef6', fontSize: 14, outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              )}
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Observaciones (opcional)</label>
                <textarea
                  value={observaciones} onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Notas adicionales..."
                  style={{ width: '100%', minHeight: 60, padding: '9px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(77,184,255,0.25)', borderRadius: 8, color: '#e8eef6', fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>
              <button
                onClick={() => confirmarCreacion(pedidoTipo)}
                disabled={createPedidoMut.isPending || (pedidoTipo === 'Solicitud' && (!cantidad || !plazoDeseado))}
                style={{ ...btnStyle(pedidoTipo === 'Solicitud Express' ? 'express' : 'primary'), width: '100%', justifyContent: 'center', padding: '10px 20px' }}
              >
                {createPedidoMut.isPending ? 'Creando...' : `Crear ${pedidoTipo}`}
              </button>
            </div>
          )}
        </div>
      )}

      <Modal open={!!confirmacion} onClose={() => setConfirmacion(null)} title="Confirmar pedido">
        {confirmacion && (
          <div>
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(42,80,128,0.25)', borderRadius: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#e8eef6', marginBottom: 4 }}>{r.nombre}</div>
              <div style={{ fontSize: 13, color: '#7aade0', marginBottom: 8 }}>
                <span style={badgeStyle('info')}>{r.referenciaCMH}</span>
                {' · '}
                <span style={badgeStyle(confirmacion.tipo)}>{confirmacion.tipo}</span>
                {' · '}
                <span style={badgeStyle('ghost')}>P: {r.panel} · C: {r.col} · F: {r.row}</span>
              </div>
              {r.metrica && <div style={{ fontSize: 12, color: '#a8cce8', marginBottom: 2 }}>Métrica: {r.metrica}</div>}
              {r.unidadEmbalaje && <div style={{ fontSize: 12, color: '#a8cce8', marginBottom: 2 }}>Ud. embalaje: {r.unidadEmbalaje}</div>}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={labelStyle}>Cantidad</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f3f6ff' }}>
                {(() => {
                  const emb = parseEmbalaje(r.unidadEmbalaje);
                  const paquetes = confirmacion.cantidad ?? r.nReposicion ?? 1;
                  const total = paquetes * emb;
                  if (emb <= 1) return `${paquetes} uds`;
                  return `${paquetes} ${r.unidadEmbalaje ? `(x ${r.unidadEmbalaje})` : ''} = ${total} uds total`;
                })()}
              </div>
            </div>
            {confirmacion.plazoDeseado && (
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={labelStyle}>Plazo deseado</div>
                <div style={{ fontSize: 14, color: '#c8ddf0' }}>{confirmacion.plazoDeseado}</div>
              </div>
            )}

            {confirmacion.observaciones && (
              <div style={{ marginBottom: '1rem', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 6, border: '1px solid rgba(42,80,128,0.15)' }}>
                <div style={labelStyle}>Observaciones</div>
                <div style={{ fontSize: 13, color: '#a8bdd0' }}>{confirmacion.observaciones}</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid rgba(42,80,128,0.4)', paddingTop: '1rem' }}>
              <button style={btnStyle('ghost')} onClick={() => setConfirmacion(null)} disabled={createPedidoMut.isPending}>
                Cancelar
              </button>
              <button style={btnStyle(confirmacion.tipo === 'Solicitud Express' ? 'express' : 'primary')} onClick={ejecutarPedido} disabled={createPedidoMut.isPending}>
                {createPedidoMut.isPending ? 'Creando...' : 'Confirmar pedido'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={editando} onClose={() => setEditando(false)} title="Editar Recambio" wide>
        <FormRecambio
          recambio={r}
          onSave={(updated) => { setEditando(false); onUpdated?.(updated); }}
          onCancel={() => setEditando(false)}
        />
      </Modal>
    </>
  );
}
