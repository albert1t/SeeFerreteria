import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../components/Modal';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { badgeStyle, btnStyle, fmtDate } from '../styles/theme';
import * as pedidosApi from '../api/pedidos';
import type { Pedido, PedidoEstado, PedidoTipo } from '../types';

const TIPOS: (PedidoTipo | 'Todos')[] = ['Todos', 'Reposición', 'Solicitud', 'Solicitud Express'];

const SIGUIENTE_ESTADO: Partial<Record<PedidoEstado, PedidoEstado>> = {
  'Solicitado': 'Pedido realizado',
  'Pedido realizado': 'Pedido recibido',
  'Pedido recibido': 'Finalizado',
};

function DetallePedido({ pedido, onClose }: { pedido: Pedido; onClose: () => void }) {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

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
      onClose();
    },
    onError: (err: Error) => showToast(err.message),
  });

  const next = SIGUIENTE_ESTADO[detail.estado];
  const labelStyle: React.CSSProperties = {
    fontSize: 12, color: '#7aade0', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4, display: 'block',
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <span style={badgeStyle(detail.tipo)}>{detail.tipo}</span>
        <span style={badgeStyle(detail.estado)}>{detail.estado}</span>
        {detail.prioritario && <span style={{ ...badgeStyle('Solicitud Express'), fontSize: 11 }}>⚡ URGENTE</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.5rem', marginBottom: '1.25rem' }}>
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
      {detail.observaciones && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={labelStyle}>Observaciones</div>
          <div style={{ fontSize: 13, color: '#a8bdd0' }}>{detail.observaciones}</div>
        </div>
      )}
      {detail.historial && detail.historial.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={labelStyle}>Historial de estados</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {detail.historial.map((h) => (
              <div key={h.id} style={{ fontSize: 12, color: '#7aade0' }}>
                {fmtDate(h.fecha)} · {h.usuarioNombre}: {h.estadoAnterior ?? '—'} → {h.estadoNuevo}
              </div>
            ))}
          </div>
        </div>
      )}
      {next && (isAdmin || detail.estado === 'Solicitado') && (
        <div style={{ borderTop: '1px solid rgba(42,80,128,0.4)', paddingTop: '1rem' }}>
          <p style={{ fontSize: 12, color: '#7aade0', margin: '0 0 0.5rem' }}>Avanzar estado del pedido:</p>
          <button
            style={btnStyle(next === 'Finalizado' ? 'success' : 'primary')}
            disabled={updateMut.isPending}
            onClick={() => updateMut.mutate(next)}
          >
            → {next}
          </button>
        </div>
      )}
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
    padding: '9px 12px', background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(77,184,255,0.25)', borderRadius: 8, color: '#e8eef6', fontSize: 14,
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Pedidos</h2>
        <span style={{ fontSize: 12, color: '#7aade0' }}>
          {activos} activos · {urgentes} urgentes
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          style={{ ...inputStyle, maxWidth: 260 }}
          placeholder="Buscar pedido..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select style={{ ...inputStyle, width: 'auto' }} value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as PedidoTipo | 'Todos')}>
          {TIPOS.map((t) => <option key={t} value={t}>{t === 'Todos' ? 'Todos los tipos' : t}</option>)}
        </select>
        <input type="date" style={{ ...inputStyle, width: 'auto' }} value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} />
        <select style={{ ...inputStyle, width: 'auto' }} value={orden} onChange={(e) => setOrden(e.target.value as 'reciente' | 'antiguo')}>
          <option value="reciente">Más reciente</option>
          <option value="antiguo">Más antiguo</option>
        </select>
        <button style={{ ...btnStyle('ghost'), fontSize: 12 }} onClick={() => setMostrarFinalizados((v) => !v)}>
          {mostrarFinalizados ? 'Ver activos' : 'Ver finalizados'}
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', color: '#4a7aaa', padding: '3rem' }}>Cargando pedidos...</div>
      ) : pedidos.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#4a7aaa', padding: '3rem' }}>Sin pedidos con los filtros actuales</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pedidos.map((p) => (
            <div
              key={p.id}
              onClick={() => setPedidoDetalle(p)}
              style={{
                background: p.prioritario ? 'rgba(192,57,43,0.08)' : 'rgba(255,255,255,0.04)',
                border: p.prioritario ? '1px solid rgba(192,57,43,0.4)' : '1px solid rgba(77,184,255,0.12)',
                borderRadius: 10, padding: '1.5rem 1.2rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = p.prioritario ? 'rgba(192,57,43,0.15)' : 'rgba(77,184,255,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = p.prioritario ? 'rgba(192,57,43,0.08)' : 'rgba(255,255,255,0.04)'; }}
            >
              {p.prioritario && <span style={{ fontSize: 20 }}>⚡</span>}
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{p.recambioNombre}</div>
                <div style={{ fontSize: 14, color: '#7aade0' }}>{p.recambioRef} · Qty: {p.cantidad} · {p.solicitanteNombre}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{...badgeStyle(p.tipo), fontSize: 14}}>{p.tipo}</span>
                <span style={{...badgeStyle(p.estado), fontSize: 14}}>{p.estado}</span>
                <span style={{ fontSize: 13, color: '#4a7aaa' }}>{fmtDate(p.fechaSolicitud)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!pedidoDetalle} onClose={() => setPedidoDetalle(null)} title={pedidoDetalle ? `Pedido #${pedidoDetalle.id}` : ''}>
        {pedidoDetalle && <DetallePedido pedido={pedidoDetalle} onClose={() => setPedidoDetalle(null)} />}
      </Modal>
    </div>
  );
}
