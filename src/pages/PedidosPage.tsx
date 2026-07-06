import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../components/Modal';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { badgeStyle, btnStyle, fmtDate } from '../styles/theme';
import * as pedidosApi from '../api/pedidos';
import type { Pedido, PedidoEstado, PedidoTipo } from '../types';

const TIPOS: (PedidoTipo | 'Todos')[] = ['Todos', 'Reposición', 'Solicitud', 'Solicitud Express'];
const ESTADOS: PedidoEstado[] = ['Solicitado', 'Pedido realizado', 'Pedido recibido', 'Finalizado'];

const SIGUIENTE_ESTADO: Partial<Record<PedidoEstado, PedidoEstado>> = {
  'Solicitado': 'Pedido realizado',
  'Pedido realizado': 'Pedido recibido',
  'Pedido recibido': 'Finalizado',
};

const ESTADO_COLOR: Record<PedidoEstado, string> = {
  'Solicitado': '#f0c040',
  'Pedido realizado': '#4db8ff',
  'Pedido recibido': '#4dff9b',
  'Finalizado': '#888',
};

function EstadoSteps({ current, onAdvance, disabled }: { current: PedidoEstado; onAdvance?: (next: PedidoEstado) => void; disabled?: boolean }) {
  const idx = ESTADOS.indexOf(current);
  return (
    <div className="pedido-estado-steps" style={{ display: 'flex', gap: 0, alignItems: 'center', marginBottom: '0.5rem' }}>
      {ESTADOS.map((estado, i) => {
        const done = i < idx;
        const active = i === idx;
        const color = done ? ESTADO_COLOR[estado] : active ? ESTADO_COLOR[estado] : '#2a3a50';
        const isNext = i === idx + 1 && onAdvance;
        return (
          <div key={estado} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            {i > 0 && (
              <div style={{
                flex: 1, height: 2,
                background: done || active ? color : '#2a3a50',
                minWidth: 4,
              }} />
            )}
            <div
              onClick={() => isNext && onAdvance?.(estado)}
              style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: done ? color : active ? color : '#1a2a3c',
                border: `2px solid ${active || done ? color : '#2a3a50'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isNext && !disabled ? 'pointer' : 'default',
                transition: 'all 0.2s',
                opacity: isNext && !disabled ? 1 : done || active ? 1 : 0.5,
                position: 'relative',
              }}
              title={isNext ? `Avanzar a ${estado}` : estado}
            >
              <span style={{
                fontSize: 8, fontWeight: 700, color: active || done ? '#fff' : '#4a5a6a',
                lineHeight: 1,
              }}>
                {i + 1}
              </span>
              {isNext && !disabled && (
                <span style={{
                  position: 'absolute', bottom: -18, fontSize: 9, color: ESTADO_COLOR[estado],
                  fontWeight: 600, whiteSpace: 'nowrap',
                }}>
                  {estado === 'Pedido realizado' ? 'Pedir' : estado === 'Pedido recibido' ? 'Recibir' : 'Finalizar'}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DetallePedido({ pedido, onClose }: { pedido: Pedido; onClose: () => void }) {
  const { can } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [confirmEstado, setConfirmEstado] = useState<PedidoEstado | null>(null);

  const { data: detail } = useQuery({
    queryKey: ['pedidos', pedido.id],
    queryFn: () => pedidosApi.getPedido(pedido.id),
    initialData: { ...pedido, historial: [] },
  });

  const updateMut = useMutation({
    mutationFn: (estado: PedidoEstado) => pedidosApi.updatePedidoEstado(pedido.id, estado),
    onSuccess: () => {
      showToast('Estado actualizado', 'success');
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      setConfirmEstado(null);
      onClose();
    },
    onError: (err: Error) => showToast(err.message),
  });

  const next = SIGUIENTE_ESTADO[detail.estado];
  const puedeAvanzar = !!(next && can('pedidos', 'edit'));
  const labelStyle: React.CSSProperties = {
    fontSize: 12, color: '#7aade0', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2, display: 'block',
  };

  return (
    <div>
      {/* Header badges */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {detail.prioritario && <span style={{ fontSize: 11, color: '#ff6b6b', fontWeight: 700, marginRight: 4 }}>URGENTE</span>}
        <span style={badgeStyle(detail.tipo)}>{detail.tipo}</span>
        <span style={badgeStyle(detail.estado)}>{detail.estado}</span>
      </div>

      {/* Progress steps */}
      <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(42,80,128,0.3)' }}>
        <EstadoSteps current={detail.estado} onAdvance={puedeAvanzar ? (estado) => setConfirmEstado(estado) : undefined} disabled={updateMut.isPending} />
      </div>

      {/* Data grid */}
      <div className="detalle-pedido-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.5rem', marginBottom: '1.25rem' }}>
        {[
          ['Recambio', detail.recambioNombre],
          ['Referencia CMH', detail.recambioRef],
          ['Cantidad', detail.cantidad],
          ['Plazo deseado', detail.plazoDeseado ?? '—'],
          ['Solicitante', detail.solicitanteNombre],
          ['Fecha solicitud', fmtDate(detail.fechaSolicitud)],
        ].map(([k, v]) => (
          <div key={k as string}>
            <div style={labelStyle}>{k}</div>
            <div style={{ fontSize: 14, color: '#c8ddf0', fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Observaciones */}
      {detail.observaciones && (
        <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(42,80,128,0.2)' }}>
          <div style={labelStyle}>Observaciones</div>
          <div style={{ fontSize: 13, color: '#a8bdd0' }}>{detail.observaciones}</div>
        </div>
      )}

      {/* Timeline */}
      {detail.historial && detail.historial.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ ...labelStyle, marginBottom: 8 }}>Historial</div>
          <div className="pedido-historial" style={{ position: 'relative', paddingLeft: 20 }}>
            {detail.historial.map((h, i) => {
              const isLast = i === detail.historial.length - 1;
              return (
                <div key={h.id} style={{ position: 'relative', paddingBottom: isLast ? 0 : 12 }}>
                  {!isLast && (
                    <div style={{
                      position: 'absolute', left: -11, top: 14, bottom: 0, width: 2,
                      background: 'rgba(77,184,255,0.25)',
                    }} />
                  )}
                  <div style={{
                    position: 'absolute', left: -15, top: 4, width: 10, height: 10, borderRadius: '50%',
                    background: ESTADO_COLOR[h.estadoNuevo as PedidoEstado] || '#4db8ff',
                    border: '2px solid #0d1b2e',
                  }} />
                  <div style={{ fontSize: 12, color: '#7aade0' }}>
                    <span style={{ color: '#c8ddf0', fontWeight: 600 }}>{fmtDate(h.fecha)}</span>
                    {' · '}{h.usuarioNombre}
                  </div>
                  <div style={{ fontSize: 12, color: '#4a7aaa' }}>
                    {h.estadoAnterior ?? '—'} <span style={{ color: '#7aade0' }}>→</span> <span style={{ color: ESTADO_COLOR[h.estadoNuevo as PedidoEstado] || '#4db8ff', fontWeight: 600 }}>{h.estadoNuevo}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirm modal */}
      <Modal open={!!confirmEstado} onClose={() => setConfirmEstado(null)} title="Confirmar avance">
        {confirmEstado && (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <p style={{ fontSize: 14, color: '#c8ddf0', marginBottom: '1.25rem' }}>
              ¿Avanzar pedido a <strong style={{ color: ESTADO_COLOR[confirmEstado] }}>{confirmEstado}</strong>?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button style={btnStyle('ghost')} onClick={() => setConfirmEstado(null)}>Cancelar</button>
              <button style={btnStyle(confirmEstado === 'Finalizado' ? 'success' : 'primary')} disabled={updateMut.isPending} onClick={() => updateMut.mutate(confirmEstado)}>
                {updateMut.isPending ? 'Actualizando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export function PedidosPage() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<PedidoTipo | 'Todos'>('Todos');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [orden, setOrden] = useState<'reciente' | 'antiguo'>('reciente');
  const [mostrarFinalizados, setMostrarFinalizados] = useState(false);
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ['pedidos', busqueda, filtroTipo, filtroFecha, orden, mostrarFinalizados],
    queryFn: () => pedidosApi.getPedidos({
      busqueda: busqueda || undefined,
      tipo: filtroTipo,
      fecha: filtroFecha || undefined,
      orden,
      incluirFinalizados: mostrarFinalizados,
    }),
  });

  const activos = pedidos.filter((p) => p.estado !== 'Finalizado').length;
  const urgentes = pedidos.filter((p) => p.prioritario && p.estado !== 'Finalizado').length;

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px', background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(77,184,255,0.25)', borderRadius: 8, color: '#e8eef6', fontSize: 13,
    outline: 'none', boxSizing: 'border-box',
  };

  const ESTADO_CARD_BORDER: Record<string, string> = {
    'Solicitado': '#b8860b',
    'Pedido realizado': '#1a6fc4',
    'Pedido recibido': '#1a8a4a',
    'Finalizado': '#4a5a6a',
  };

  return (
    <div className="pedidos-page" style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div className="pedidos-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Pedidos</h2>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#7aade0' }}>
          <span><span style={{ color: '#f0c040', fontWeight: 700 }}>{activos}</span> activos</span>
          {urgentes > 0 && <span><span style={{ color: '#ff6b6b', fontWeight: 700 }}>{urgentes}</span> urgentes</span>}
        </div>
      </div>

      {/* Filters */}
      <div className="pedidos-filters" style={{
        display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap', padding: '0.75rem 1rem',
        background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(42,80,128,0.25)',
        alignItems: 'center',
      }}>
        <input
          className="pedidos-search-input"
          style={{ ...inputStyle, maxWidth: 220, flex: 1, minWidth: 120 }}
          placeholder="Buscar pedido..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button className="mobile-filter-btn" style={{ ...btnStyle('primary'), fontSize: 12, padding: '6px 12px', display: 'none' }} onClick={() => setMostrarFiltros((v) => !v)}>
          {mostrarFiltros ? 'Ocultar' : 'Filtrar'}
        </button>
        <div className="filters-collapsible" data-expanded={mostrarFiltros} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select style={{ ...inputStyle, width: 'auto' }} value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as PedidoTipo | 'Todos')}>
            {TIPOS.map((t) => <option key={t} value={t}>{t === 'Todos' ? 'Todos los tipos' : t}</option>)}
          </select>
          <input type="date" style={{ ...inputStyle, width: 'auto' }} value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} />
          <select style={{ ...inputStyle, width: 'auto' }} value={orden} onChange={(e) => setOrden(e.target.value as 'reciente' | 'antiguo')}>
            <option value="reciente">Más reciente</option>
            <option value="antiguo">Más antiguo</option>
          </select>
          <button style={{ ...btnStyle('ghost'), fontSize: 12, padding: '6px 12px' }} onClick={() => setMostrarFinalizados((v) => !v)}>
            {mostrarFinalizados ? 'Ocultar finalizados' : 'Ver finalizados'}
          </button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              height: 60, borderRadius: 10, background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(42,80,128,0.15)', animation: 'pulse 1.5s infinite',
            }} />
          ))}
        </div>
      ) : pedidos.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#4a7aaa', padding: '3rem', fontSize: 14 }}>
          Sin pedidos con los filtros actuales
        </div>
      ) : (
        <div className="pedidos-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pedidos.map((p) => {
            const borderColor = ESTADO_CARD_BORDER[p.estado] || '#2a5080';
            return (
              <div
                key={p.id}
                className="pedido-card"
                onClick={() => setPedidoDetalle(p)}
                style={{
                  background: p.prioritario ? 'rgba(192,57,43,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${p.prioritario ? 'rgba(192,57,43,0.35)' : 'rgba(42,80,128,0.2)'}`,
                  borderLeft: `4px solid ${p.prioritario ? '#c0392b' : borderColor}`,
                  borderRadius: 10, padding: '1rem 1.2rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = p.prioritario ? 'rgba(192,57,43,0.15)' : 'rgba(77,184,255,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = p.prioritario ? 'rgba(192,57,43,0.08)' : 'rgba(255,255,255,0.03)'; }}
              >
                {p.recambioImagen && (
                <img className="pedido-card-img" src={p.recambioImagen} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              )}
              {p.prioritario && <span className="urgente-tag" style={{ fontSize: 10, color: '#ff6b6b', fontWeight: 700, flexShrink: 0 }}>URGENTE</span>}
                <div className="pedido-card-info" style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{p.recambioNombre}</div>
                  <div className="pedido-card-meta" style={{ fontSize: 12, color: '#7aade0' }}>
                    {p.recambioRef} · {p.solicitanteNombre} · Qty: {p.cantidad}
                  </div>
                </div>
                <div className="pedido-badges-row" style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ ...badgeStyle(p.tipo), fontSize: 11 }}>{p.tipo}</span>
                  <span style={{ ...badgeStyle(p.estado), fontSize: 11 }}>{p.estado}</span>
                  <span className="pedido-date" style={{ fontSize: 11, color: '#4a7aaa', whiteSpace: 'nowrap' }}>{fmtDate(p.fechaSolicitud)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!pedidoDetalle} onClose={() => setPedidoDetalle(null)} title={pedidoDetalle ? `Pedido #${pedidoDetalle.id}` : ''}>
        {pedidoDetalle && <DetallePedido pedido={pedidoDetalle} onClose={() => setPedidoDetalle(null)} />}
      </Modal>
    </div>
  );
}
