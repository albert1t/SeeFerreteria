import { useState, Fragment } from 'react';
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
  'Solicitado': 'var(--warning-text)',
  'Pedido realizado': 'var(--accent)',
  'Pedido recibido': 'var(--success-text)',
  'Finalizado': 'var(--text-muted-2)',
};

function EstadoSteps({ current, onAdvance, disabled }: { current: PedidoEstado; onAdvance?: (next: PedidoEstado) => void; disabled?: boolean }) {
  const idx = ESTADOS.indexOf(current);
  const progressColor = 'var(--accent)';
  return (
    <div className="pedido-estado-steps" style={{ display: 'flex', gap: 0, alignItems: 'flex-start', marginBottom: '0.5rem' }}>
      {ESTADOS.map((estado, i) => {
        const done = i < idx;
        const active = i === idx;
        const isNext = i === idx + 1 && onAdvance;
        return (
          <Fragment key={estado}>
            {i > 0 && (
              <div className="step-connector" style={{ flex: 1, display: 'flex', alignItems: 'center', marginTop: 15 }}>
                <div style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: done || active || isNext ? progressColor : 'var(--step-inactive)',
                  opacity: done || active || isNext ? 1 : 0.5,
                  transition: 'background 0.3s, opacity 0.3s',
                }} />
              </div>
            )}
            <div className="step-node" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <div
                onClick={() => isNext && !disabled && onAdvance?.(estado)}
                title={isNext ? `Avanzar a ${estado}` : estado}
                style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: done || active ? progressColor : 'var(--step-fill)',
                  border: isNext
                    ? `2px dashed ${progressColor}`
                    : `2px solid ${active || done ? progressColor : 'var(--step-inactive)'}`,
                  boxShadow: active ? `0 0 0 4px var(--bg-hover-strong), 0 0 12px ${progressColor}` : isNext ? `0 0 0 4px var(--bg-hover-strong), 0 0 10px ${progressColor}` : done ? '0 1px 4px var(--shadow-strong)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: isNext && !disabled ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  position: 'relative',
                  ['--step-glow' as string]: isNext ? progressColor : undefined,
                  animation: isNext && !disabled ? 'stepNextPulse 2s ease-in-out infinite' : undefined,
                }}
                onMouseEnter={(e) => {
                  if (isNext && !disabled) {
                    e.currentTarget.style.transform = 'scale(1.12)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8.5 L6.5 12 L13 4.5" />
                  </svg>
                ) : (
                  <span style={{
                    fontSize: 12, fontWeight: 800, color: isNext ? progressColor : active ? '#fff' : 'var(--text-dim-strong)',
                    lineHeight: 1,
                  }}>
                    {i + 1}
                  </span>
                )}
              </div>
              <div className="step-label" style={{
                fontSize: 11, fontWeight: active || isNext ? 700 : 600,
                color: isNext ? progressColor : active ? progressColor : done ? 'var(--text-muted)' : 'var(--text-faint-2)',
                whiteSpace: 'nowrap', textAlign: 'center', maxWidth: 96,
              }}>
                {estado}
              </div>
            </div>
          </Fragment>
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
  const [editando, setEditando] = useState(false);
  const [editCantidad, setEditCantidad] = useState('');
  const [editPlazo, setEditPlazo] = useState('');
  const [editObs, setEditObs] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const editMut = useMutation({
    mutationFn: (data: { cantidad?: number; plazoDeseado?: string | null; observaciones?: string | null }) =>
      pedidosApi.updatePedido(pedido.id, data),
    onSuccess: () => {
      showToast('Pedido actualizado', 'success');
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      setEditando(false);
      onClose();
    },
    onError: (err: Error) => showToast(err.message),
  });

  const deleteMut = useMutation({
    mutationFn: () => pedidosApi.deletePedido(pedido.id),
    onSuccess: () => {
      showToast('Pedido eliminado', 'success');
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      setConfirmDelete(false);
      onClose();
    },
    onError: (err: Error) => showToast(err.message),
  });

  const toggleOcultoMut = useMutation({
    mutationFn: () => pedidosApi.toggleOcultoPedido(pedido.id),
    onSuccess: (r) => {
      showToast(r.oculto ? 'Pedido ocultado' : 'Pedido visible', 'success');
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      onClose();
    },
    onError: (err: Error) => showToast(err.message),
  });

  function abrirEditar() {
    setEditCantidad(String(detail.cantidad));
    setEditPlazo(detail.plazoDeseado ?? '');
    setEditObs(detail.observaciones ?? '');
    setEditando(true);
  }

  const next = SIGUIENTE_ESTADO[detail.estado];
  const puedeAvanzar = !!(next && can('pedidos', 'edit'));
  const puedeEditar = can('pedidos', 'edit');
  const puedeEliminar = can('pedidos', 'delete');
  const labelStyle: React.CSSProperties = {
    fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2, display: 'block',
  };

  function parseEmbalaje(embalaje: string | null | undefined): number {
    if (!embalaje) return 1;
    const match = embalaje.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  }

  const embalaje = parseEmbalaje(detail.recambioEmbalaje);
  const paquetes = detail.cantidad;
  const totalUnidades = paquetes * embalaje;
  const precioTotal = detail.recambioPrecio != null ? paquetes * detail.recambioPrecio : null;

  return (
    <div>
      {/* Header badges + avanzar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', flex: 1, minWidth: 0 }}>
          {detail.prioritario && <span style={{ fontSize: 11, color: 'var(--danger-text)', fontWeight: 700, marginRight: 4 }}>URGENTE</span>}
          <span style={badgeStyle(detail.tipo)}>{detail.tipo}</span>
          <span style={badgeStyle(detail.estado)}>{detail.estado}</span>
          {detail.oculto && <span style={{ ...badgeStyle('Finalizado'), fontSize: 11 }}>Oculto</span>}
        </div>
        {puedeAvanzar && detail.estado !== 'Finalizado' && (
          <button
            type="button"
            disabled={updateMut.isPending}
            onClick={() => setConfirmEstado(SIGUIENTE_ESTADO[detail.estado]!)}
            title={`Avanzar a ${SIGUIENTE_ESTADO[detail.estado]}`}
            style={{
              ...btnStyle('primary'),
              background: 'var(--accent)',
              borderColor: 'var(--accent)',
              color: '#fff',
              fontSize: 13,
              padding: '7px 16px',
              boxShadow: '0 2px 12px color-mix(in srgb, var(--accent) 60%, transparent)',
              whiteSpace: 'nowrap',
            }}
          >
            Avanzar a {SIGUIENTE_ESTADO[detail.estado]}
          </button>
        )}
      </div>

      {/* Progress steps */}
      <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'var(--bg-card-soft)', borderRadius: 10, border: '1px solid var(--border-soft)' }}>
        <div style={{ ...labelStyle, marginBottom: 8 }}>Progreso</div>
        <EstadoSteps current={detail.estado} onAdvance={puedeAvanzar ? (estado) => setConfirmEstado(estado) : undefined} disabled={updateMut.isPending} />
      </div>

      {/* Data grid */}
      <div className="detalle-pedido-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.5rem', marginBottom: '1.25rem' }}>
        {[
          ['Recambio', detail.recambioNombre],
          ['Referencia CMH', detail.recambioRef],
          ['Cantidad', `${detail.cantidad} paquete${detail.cantidad === 1 ? '' : 's'}${detail.recambioEmbalaje ? ` × ${embalaje} uds = ${totalUnidades} uds` : ''}`],
          ['Plazo deseado', detail.plazoDeseado ?? '—'],
          ['Solicitante', detail.solicitanteNombre],
          ['Fecha solicitud', fmtDate(detail.fechaSolicitud)],
          ['PVP orientativo', detail.recambioPrecio != null ? `${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(detail.recambioPrecio)}/paquete` : '—'],
          ['Total orientativo', precioTotal != null ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(precioTotal) : '—'],
        ].map(([k, v]) => (
          <div key={k as string}>
            <div style={labelStyle}>{k}</div>
            <div style={{ fontSize: 14, color: 'var(--text-light)', fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Observaciones */}
      {detail.observaciones && (
        <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'var(--bg-card-soft)', borderRadius: 8, border: '1px solid var(--border-soft-2)' }}>
          <div style={labelStyle}>Observaciones</div>
          <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>{detail.observaciones}</div>
        </div>
      )}

      {/* Admin actions */}
      {(puedeEditar || puedeEliminar) && (
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-soft)' }}>
          {puedeEditar && (
            <>
              <button style={btnStyle('primary')} onClick={abrirEditar} disabled={editMut.isPending}>Editar</button>
              <button style={btnStyle('ghost')} onClick={() => toggleOcultoMut.mutate()} disabled={toggleOcultoMut.isPending}>
                {detail.oculto ? 'Mostrar' : 'Ocultar'}
              </button>
            </>
          )}
          {puedeEliminar && (
            <button style={{ ...btnStyle('danger'), marginLeft: 'auto' }} onClick={() => setConfirmDelete(true)} disabled={deleteMut.isPending}>
              Eliminar
            </button>
          )}
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
                      background: 'var(--border-input)',
                    }} />
                  )}
                  <div style={{
                    position: 'absolute', left: -15, top: 4, width: 10, height: 10, borderRadius: '50%',
                    background: ESTADO_COLOR[h.estadoNuevo as PedidoEstado] || 'var(--accent)',
                    border: '2px solid var(--bg)',
                  }} />
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>{fmtDate(h.fecha)}</span>
                    {' · '}{h.usuarioNombre}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                    {h.estadoAnterior ?? '—'} <span style={{ color: 'var(--text-muted)' }}>→</span> <span style={{ color: ESTADO_COLOR[h.estadoNuevo as PedidoEstado] || 'var(--accent)', fontWeight: 600 }}>{h.estadoNuevo}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit modal */}
      <Modal open={editando} onClose={() => setEditando(false)} title="Editar pedido">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 300 }}>
          <div>
            <label style={labelStyle}>Cantidad (paquetes)</label>
            <input type="number" min="1" value={editCantidad} onChange={(e) => setEditCantidad(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: 8, color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={labelStyle}>Plazo deseado</label>
            <input type="text" value={editPlazo} onChange={(e) => setEditPlazo(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: 8, color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={labelStyle}>Observaciones</label>
            <textarea value={editObs} onChange={(e) => setEditObs(e.target.value)}
              style={{ width: '100%', minHeight: 60, padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: 8, color: 'var(--text)', fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button style={btnStyle('ghost')} onClick={() => setEditando(false)}>Cancelar</button>
            <button style={btnStyle('primary')} disabled={editMut.isPending || !editCantidad || parseInt(editCantidad, 10) < 1}
              onClick={() => editMut.mutate({ cantidad: parseInt(editCantidad, 10), plazoDeseado: editPlazo || null, observaciones: editObs || null })}>
              {editMut.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Confirmar eliminación">
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: '1.25rem' }}>
            ¿Eliminar el pedido <strong>#{pedido.id}</strong>? Esta acción no se puede deshacer.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button style={btnStyle('ghost')} onClick={() => setConfirmDelete(false)}>Cancelar</button>
            <button style={btnStyle('danger')} disabled={deleteMut.isPending} onClick={() => deleteMut.mutate()}>
              {deleteMut.isPending ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm state advance */}
      <Modal open={!!confirmEstado} onClose={() => setConfirmEstado(null)} title="Confirmar avance">
        {confirmEstado && (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: '1.25rem' }}>
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
  const [mostrarOcultos, setMostrarOcultos] = useState(false);
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ['pedidos', busqueda, filtroTipo, filtroFecha, orden, mostrarFinalizados, mostrarOcultos],
    queryFn: () => pedidosApi.getPedidos({
      busqueda: busqueda || undefined,
      tipo: filtroTipo,
      fecha: filtroFecha || undefined,
      orden,
      incluirFinalizados: mostrarFinalizados,
      incluirOcultos: mostrarOcultos,
    }),
  });

  const activos = pedidos.filter((p) => p.estado !== 'Finalizado').length;
  const urgentes = pedidos.filter((p) => p.prioritario && p.estado !== 'Finalizado').length;

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px', background: 'var(--bg-input)',
    border: '1px solid var(--border-input)', borderRadius: 8, color: 'var(--text)', fontSize: 13,
    outline: 'none', boxSizing: 'border-box',
  };

  const ESTADO_CARD_BORDER: Record<string, string> = {
    'Solicitado': 'var(--warning)',
    'Pedido realizado': 'var(--accent-dark)',
    'Pedido recibido': 'var(--success)',
    'Finalizado': 'var(--text-dim-strong)',
  };

  return (
    <div className="pedidos-page" style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div className="pedidos-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Pedidos</h2>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
          <span><span style={{ color: 'var(--warning-text)', fontWeight: 700 }}>{activos}</span> activos</span>
          {urgentes > 0 && <span><span style={{ color: 'var(--danger-text)', fontWeight: 700 }}>{urgentes}</span> urgentes</span>}
        </div>
      </div>

      {/* Filters */}
      <div className="pedidos-filters" style={{
        display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap', padding: '0.75rem 1rem',
        background: 'var(--bg-card-soft)', borderRadius: 10, border: '1px solid var(--border-soft-2)',
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
          <button style={{ ...btnStyle('ghost'), fontSize: 12, padding: '6px 12px' }} onClick={() => setMostrarOcultos((v) => !v)}>
            {mostrarOcultos ? 'Ocultar ocultos' : 'Mostrar ocultos'}
          </button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              height: 60, borderRadius: 10, background: 'var(--bg-card-soft)',
              border: '1px solid var(--border-soft-2)', animation: 'pulse 1.5s infinite',
            }} />
          ))}
        </div>
      ) : pedidos.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '3rem', fontSize: 14 }}>
          Sin pedidos con los filtros actuales
        </div>
      ) : (
        <div className="pedidos-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pedidos.map((p) => {
            const borderColor = ESTADO_CARD_BORDER[p.estado] || 'var(--border-strong)';
            return (
              <div
                key={p.id}
                className="pedido-card"
                onClick={() => setPedidoDetalle(p)}
                style={{
                  background: p.oculto ? 'rgba(100,100,100,0.05)' : p.prioritario ? 'var(--bg-danger-soft)' : 'var(--bg-card-soft)',
                  border: `1px solid ${p.oculto ? 'rgba(100,100,100,0.2)' : p.prioritario ? 'var(--border-danger-strong)' : 'var(--border-soft-2)'}`,
                  borderLeft: `4px solid ${p.prioritario ? 'var(--danger)' : borderColor}`,
                  borderRadius: 10, padding: '1rem 1.2rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = p.prioritario ? 'var(--bg-danger-hover)' : 'var(--bg-accent-faint)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = p.prioritario ? 'var(--bg-danger-soft)' : 'var(--bg-card-soft)'; }}
              >
                {p.recambioImagen && (
                <img className="pedido-card-img" src={p.recambioImagen} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              )}
              {p.prioritario && <span className="urgente-tag" style={{ fontSize: 10, color: 'var(--danger-text)', fontWeight: 700, flexShrink: 0 }}>URGENTE</span>}
              {p.oculto && <span style={{ fontSize: 10, color: 'var(--text-muted-2)', fontWeight: 700, flexShrink: 0 }}>OCULTO</span>}
                <div className="pedido-card-info" style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{p.recambioNombre}</div>
                  <div className="pedido-card-meta" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {p.recambioRef} · {p.solicitanteNombre} · Qty: {p.cantidad} paq
                  </div>
                  {p.recambioPrecio != null && (
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--success-text)' }}>
                      {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(p.recambioPrecio * p.cantidad)}
                    </div>
                  )}
                </div>
                <div className="pedido-badges-row" style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ ...badgeStyle(p.tipo), fontSize: 11 }}>{p.tipo}</span>
                  <span style={{ ...badgeStyle(p.estado), fontSize: 11 }}>{p.estado}</span>
                  <span className="pedido-date" style={{ fontSize: 11, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{fmtDate(p.fechaSolicitud)}</span>
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
