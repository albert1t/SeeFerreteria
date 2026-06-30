import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { badgeStyle, btnStyle, fmtDate } from '../styles/theme';
import { Modal } from './Modal';
import { FormRecambio } from './FormRecambio';
import { useToast } from './Toast';
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

  function crearPedido(tipo: PedidoTipo) {
    if (tipo === 'Reposición') {
      createPedidoMut.mutate({ recambioId: recambio.id, tipo });
      return;
    }
    if (tipo === 'Solicitud' && (!cantidad || !plazoDeseado)) {
      showToast('Indica cantidad y plazo deseado');
      return;
    }
    createPedidoMut.mutate({
      recambioId: recambio.id,
      tipo,
      cantidad: cantidad ? parseInt(cantidad, 10) : undefined,
      plazoDeseado: plazoDeseado || undefined,
      observaciones: observaciones || undefined,
    });
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
        {r.imagen && (
          <img src={r.imagen} alt={r.nombre} style={{ width: 100, height: 100, borderRadius: 10, border: '1px solid #2a5080', objectFit: 'cover' }} />
        )}
        <div style={{ flex: 1, minWidth: 200 }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700 }}>{r.nombre}</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <span style={badgeStyle('info')}>{r.referenciaCMH}</span>
            {r.marca && <span style={badgeStyle('ghost')}>{r.marca}</span>}
            <span style={badgeStyle('ghost')}>{r.panel} · C{r.col}F{r.row}</span>
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
              ['N° Reposición', r.nReposicion],
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ color: '#7aade0', fontSize: 13, margin: '0 0 0.5rem' }}>Selecciona el tipo de pedido:</p>
              <button
                onClick={() => crearPedido('Reposición')}
                disabled={createPedidoMut.isPending}
                style={{ ...btnStyle('primary'), justifyContent: 'flex-start', padding: '1rem 1.25rem' }}
              >
                <span style={{ fontSize: 20 }}>🔄</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>Reposición</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>Pedido automático · {r.nReposicion} unidades</div>
                </div>
              </button>
              <button onClick={() => setPedidoTipo('Solicitud')} style={{ ...btnStyle('success'), justifyContent: 'flex-start', padding: '1rem 1.25rem' }}>
                <span style={{ fontSize: 20 }}>📋</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>Solicitud</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>Especificar cantidad y plazo</div>
                </div>
              </button>
              <button onClick={() => setPedidoTipo('Solicitud Express')} style={{ ...btnStyle('express'), justifyContent: 'flex-start', padding: '1rem 1.25rem' }}>
                <span style={{ fontSize: 20 }}>⚡</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>Solicitud Express</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>Prioritario · Máxima urgencia</div>
                </div>
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
                <span style={badgeStyle(pedidoTipo)}>{pedidoTipo}</span>
                <button onClick={() => setPedidoTipo(null)} style={{ background: 'none', border: 'none', color: '#7aade0', cursor: 'pointer', fontSize: 12 }}>← Cambiar tipo</button>
              </div>
              {pedidoTipo !== 'Reposición' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Cantidad {pedidoTipo === 'Solicitud' ? '*' : ''}</label>
                  <input
                    type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)}
                    placeholder="Ej: 50"
                    style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(77,184,255,0.25)', borderRadius: 8, color: '#e8eef6', fontSize: 14 }}
                  />
                </div>
              )}
              {pedidoTipo === 'Solicitud' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Plazo deseado *</label>
                  <input
                    value={plazoDeseado} onChange={(e) => setPlazoDeseado(e.target.value)}
                    placeholder="Ej: 3 días"
                    style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(77,184,255,0.25)', borderRadius: 8, color: '#e8eef6', fontSize: 14 }}
                  />
                </div>
              )}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Observaciones (opcional)</label>
                <textarea
                  value={observaciones} onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Notas adicionales..."
                  style={{ width: '100%', minHeight: 60, padding: '9px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(77,184,255,0.25)', borderRadius: 8, color: '#e8eef6', fontSize: 14, resize: 'vertical' }}
                />
              </div>
              <button
                onClick={() => crearPedido(pedidoTipo)}
                disabled={createPedidoMut.isPending || (pedidoTipo === 'Solicitud' && (!cantidad || !plazoDeseado))}
                style={{ ...btnStyle(pedidoTipo === 'Solicitud Express' ? 'express' : 'primary'), width: '100%', justifyContent: 'center' }}
              >
                {createPedidoMut.isPending ? 'Creando...' : 'Crear Pedido'}
              </button>
            </div>
          )}
        </div>
      )}

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
