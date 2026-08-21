import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { badgeStyle, btnStyle, fmtDate } from '../styles/theme';
import { Modal } from './Modal';
import { FormRecambio } from './FormRecambio';
import { useToast } from './Toast';
import { NoImageSlot } from './PlaceholderImage';
import * as recambiosApi from '../api/products';
import * as pedidosApi from '../api/orders';
import type { OrderType, Product } from '../types';

interface FichaTecnicaProps {
  product: Product;
  onClose: () => void;
  onUpdated?: (r: Product) => void;
}

export function FichaTecnica({ product, onClose, onUpdated }: FichaTecnicaProps) {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'info' | 'orders' | 'nuevo'>('info');
  const [orderType, setPedidoTipo] = useState<OrderType | null>(null);
  const [quantity, setCantidad] = useState('');
  const [desiredDeadline, setPlazoDeseado] = useState('');
  const [notes, setObservaciones] = useState('');
  const [editando, setEditando] = useState(false);
  const [confirmacion, setConfirmacion] = useState<{ type: OrderType; quantity?: number; desiredDeadline?: string; notes?: string } | null>(null);
  const fechaRef = useRef<HTMLInputElement>(null);

  function parseEmbalaje(embalaje: string | null | undefined): number {
    if (!embalaje) return 1;
    const match = embalaje.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  }

  function fmtPrecio(v: number | null | undefined): string | null {
    if (v == null) return null;
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);
  }

  const { data: detail } = useQuery({
    queryKey: ['products', product.id],
    queryFn: () => recambiosApi.getRecambio(product.id),
    initialData: { ...product, orders: [] },
  });

  const createOrderMut = useMutation({
    mutationFn: pedidosApi.createOrder,
    onSuccess: () => {
      showToast('Order creado correctamente', 'success');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products', product.id] });
      setPedidoTipo(null);
      setCantidad('');
      setPlazoDeseado('');
      setObservaciones('');
      setTab('orders');
    },
    onError: (err: Error) => showToast(err.message),
  });

  const toggleOcultoMut = useMutation({
    mutationFn: () => recambiosApi.toggleOculto(product.id),
    onSuccess: (r) => {
      showToast(r.hidden ? 'Product ocultado' : 'Product visible', 'success');
      onUpdated?.(r);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['panels'] });
    },
    onError: (err: Error) => showToast(err.message),
  });

  const deleteMut = useMutation({
    mutationFn: () => recambiosApi.deleteProduct(product.id),
    onSuccess: () => {
      showToast('Product eliminado', 'success');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['panels'] });
      onClose();
    },
    onError: (err: Error) => showToast(err.message),
  });

  function confirmarCreacion(type: OrderType) {
    if (type === 'Reposición' && r.reorderPoint == null) {
      showToast('Este product no tiene un número de reposición. Configúralo antes de crear un order automático.', 'error');
      return;
    }
    if (type === 'Solicitud' && (!quantity || !desiredDeadline)) {
      showToast('Indica quantity y plazo deseado');
      return;
    }
    setConfirmacion({
      type,
      quantity: quantity ? parseInt(quantity, 10) : undefined,
      desiredDeadline: desiredDeadline || undefined,
      notes: notes || undefined,
    });
  }

  function paquetesPedido(): number {
    if (confirmacion?.type === 'Reposición') return confirmacion.quantity ?? r.reorderPoint ?? 1;
    return confirmacion?.quantity ?? 0;
  }

  function ejecutarPedido() {
    if (!confirmacion) return;
    createOrderMut.mutate({
      productId: product.id,
      type: confirmacion.type,
      quantity: paquetesPedido(),
      desiredDeadline: confirmacion.desiredDeadline,
      notes: confirmacion.notes,
    });
    setConfirmacion(null);
  }

  const r = detail;
  const myOrders = r.orders ?? [];
  const pendingOrders = myOrders.filter(p => p.status !== 'Finalizado');

  const labelStyle: React.CSSProperties = {
    fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4, display: 'block',
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {r.image ? (
          <img src={r.image} alt={r.name} style={{ width: 100, height: 100, borderRadius: 10, border: '1px solid var(--border-strong)', objectFit: 'cover' }} />
        ) : (
          <NoImageSlot size={100} style={{ borderRadius: 10, border: '1px solid var(--border-strong)' }} />
        )}
        <div style={{ flex: 1, minWidth: 200 }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700 }}>{r.name}</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <span style={badgeStyle('info')}>{r.cmhReference}</span>
            {r.brand && <span style={badgeStyle('ghost')}>{r.brand}</span>}
            <span style={badgeStyle('ghost')}>P: {r.panel} · C: {r.col} · F: {r.row}</span>
            {r.hidden && <span style={badgeStyle('Finalizado')}>Oculto</span>}
          </div>
          {r.description && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{r.description}</div>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-strong)', paddingBottom: '0.75rem' }}>
        {(['info', 'orders', 'nuevo'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              ...btnStyle('ghost'), fontSize: 12, padding: '6px 14px',
              ...(tab === t ? { background: 'var(--bg-hover-strong)', borderColor: 'var(--accent)', color: 'var(--accent)' } : {}),
            }}
          >
            {t === 'info' ? 'Info' : t === 'orders' ? `Historial (${myOrders.length})` : 'Nuevo Pedido'}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div>
          {/* Pending orders banner */}
          {pendingOrders.length > 0 && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-warning-soft)', border: '1px solid var(--border-warning)', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, color: 'var(--warning-alt)', marginBottom: 4 }}>Orders pendientes</div>
              {pendingOrders.map(p => (
                <div key={p.id} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={badgeStyle(p.type)}>{p.type}</span>
                    <span style={badgeStyle(p.status)}>{p.status}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {fmtDate(p.requestedAt)} · {p.requesterName} · Qty: {p.quantity}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Original info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.5rem', marginBottom: '1rem' }}>
            {[
              ['Ref. CMH', r.cmhReference],
              ['Ref. Cliente', r.customerReference ?? '—'],
              ['Código', r.code ?? '—'],
              ['Marca', r.brand ?? '—'],
              ['Métrica', r.metric ?? '—'],
              ['Unidad de embalaje', r.packagingUnit ?? '—'],
              ['Plazo de entrega', r.deliveryTime ?? '—'],
              ['Family', r.familyName ?? '—'],
              ['N° Reposición', r.reorderPoint ?? '—'],
              ['PVP orientativo', r.pvpOrientativo != null ? fmtPrecio(r.pvpOrientativo) : '—'],
              ['Ubicación', `${r.panel} - Col ${r.col} Fila ${r.row}`],
            ].map(([k, v]) => (
              <div key={k as string}>
                <div style={labelStyle}>{k}</div>
                <div style={{ fontSize: 14, color: 'var(--text-light)', fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>

          {isAdmin && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-soft)' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={btnStyle('ghost')} onClick={() => setEditando(true)}>Editar</button>
                <button style={btnStyle('danger')} onClick={() => { if (confirm('¿Eliminar product?')) deleteMut.mutate(); }}>
                  Eliminar
                </button>
              </div>
              <button style={{ ...btnStyle('ghost'), marginLeft: 'auto' }} onClick={() => toggleOcultoMut.mutate()}>
                {r.hidden ? 'Mostrar' : 'Ocultar'}
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'orders' && (
        <div>
          {myOrders.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>Sin historial de orders</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...myOrders].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()).map((p) => (
                <div key={p.id} style={{ background: 'var(--bg-card-soft)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={badgeStyle(p.type)}>{p.type}</span>
                    <span style={badgeStyle(p.status)}>{p.status}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {fmtDate(p.requestedAt)} · {p.requesterName} · Qty: {p.quantity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'nuevo' && (
        <div>
          {!orderType ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '0 0 2px' }}>Selecciona el type de order:</p>
              {r.pvpOrientativo != null && (
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--success-text)', background: 'var(--bg-success-soft)', border: '1px solid var(--success)', padding: '8px 14px', borderRadius: 8, marginBottom: 6 }}>
                  PVP orientativo: {fmtPrecio(r.pvpOrientativo)}/paquete
                </div>
              )}
              {r.packagingUnit && (
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-bright)', background: 'var(--bg-hover-strong)', border: '1px solid var(--border-input)', padding: '8px 14px', borderRadius: 8, marginBottom: 6 }}>
                  Ud. embalaje: {r.packagingUnit}
                </div>
              )}
              {([
                { type: 'Reposición' as OrderType, label: 'Automático', desc: `${(() => { if (r.reorderPoint == null) return 'Número de reposición no configurado'; const paq = r.reorderPoint; const emb = parseEmbalaje(r.packagingUnit); const total = paq * emb; return emb > 1 ? `${paq} paquetes × ${r.packagingUnit} = ${total} uds` : `${paq} uds`; })()}`, color: 'var(--accent)', bgCard: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' },
                { type: 'Solicitud' as OrderType, label: 'Personalizado', desc: 'Cantidad y plazo a definir', color: 'var(--success-text)', bgCard: 'var(--bg-success-card)', borderColor: 'var(--success-border)' },
                { type: 'Solicitud Express' as OrderType, label: 'Urgente', desc: 'Prioritario · entrega inmediata', color: 'var(--danger-text)', bgCard: 'var(--bg-danger-card)', borderColor: 'var(--danger-border)' },
              ]).map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => opt.type === 'Reposición' ? confirmarCreacion(opt.type) : setPedidoTipo(opt.type)}
                  disabled={createOrderMut.isPending || (opt.type === 'Reposición' && r.reorderPoint == null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: 0,
                    background: opt.bgCard, border: `1px solid ${opt.borderColor}`, borderRadius: 12,
                    cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', width: '100%',
                    opacity: createOrderMut.isPending ? 0.6 : 1, overflow: 'hidden',
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
                      <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{opt.type}</span>
                      <span style={{ fontSize: 10, color: opt.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{opt.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{opt.desc}</div>
                  </div>
                  {/* Action chevron */}
                  <div style={{
                    padding: '0 16px', fontSize: 20, color: opt.color, flexShrink: 0, fontWeight: 300,
                  }}>
                    {opt.type === 'Reposición' ? '→' : '›'}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={badgeStyle(orderType)}>{orderType}</span>
                <button onClick={() => setPedidoTipo(null)} style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12,
                  padding: 0, textDecoration: 'underline', textUnderlineOffset: 3,
                }}>
                  Cambiar type
                </button>
                {r.packagingUnit && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-bright)', background: 'var(--bg-hover-strong)', border: '1px solid var(--border-input)', padding: '5px 12px', borderRadius: 6, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                    Ud. embalaje: {r.packagingUnit}
                  </span>
                )}
                {r.pvpOrientativo != null && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--success-text)', background: 'var(--bg-success-card)', border: '1px solid var(--success-border)', padding: '5px 12px', borderRadius: 6, whiteSpace: 'nowrap' }}>
                    {fmtPrecio(r.pvpOrientativo)}/paquete
                  </span>
                )}
              </div>
              {orderType !== 'Reposición' && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={labelStyle}>N° paquetes {orderType === 'Solicitud' ? '*' : ''}</label>
                  <input
                    type="number" min="1" value={quantity} onChange={(e) => setCantidad(e.target.value)}
                    placeholder="Ej: 5"
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: 8, color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                  {r.packagingUnit && quantity && !isNaN(parseInt(quantity, 10)) && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      {parseInt(quantity, 10)} × {r.packagingUnit} = <strong style={{ color: 'var(--accent)' }}>{parseInt(quantity, 10) * parseEmbalaje(r.packagingUnit)} uds</strong> total
                      {r.pvpOrientativo != null && (
                        <> · Total: <strong style={{ color: 'var(--success-text)' }}>{fmtPrecio(parseInt(quantity, 10) * r.pvpOrientativo)}</strong></>
                      )}
                    </div>
                  )}
                </div>
              )}
              {orderType === 'Solicitud' && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={labelStyle}>Fecha deseada de entrega *</label>
                  <div
                    onClick={() => fechaRef.current?.showPicker()}
                    style={{ cursor: 'pointer', width: '100%' }}
                  >
                    <input
                      ref={fechaRef}
                      type="date"
                      value={desiredDeadline} onChange={(e) => setPlazoDeseado(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: 8, color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              )}
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Observaciones (opcional)</label>
                <textarea
                  value={notes} onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Notas adicionales..."
                  style={{ width: '100%', minHeight: 60, padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: 8, color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>
              <button
                onClick={() => confirmarCreacion(orderType)}
                disabled={createOrderMut.isPending || (orderType === 'Solicitud' && (!quantity || !desiredDeadline))}
                style={{ ...btnStyle(orderType === 'Solicitud Express' ? 'express' : 'primary'), width: '100%', justifyContent: 'center', padding: '10px 20px' }}
              >
                {createOrderMut.isPending ? 'Creando...' : `Crear ${orderType}`}
              </button>
            </div>
          )}
        </div>
      )}

      <Modal open={!!confirmacion} onClose={() => setConfirmacion(null)} title="Confirmar pedido">
        {confirmacion && (
          <div>
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-card-soft)', border: '1px solid var(--border-soft-2)', borderRadius: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', marginBottom: 4 }}>{r.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                <span style={badgeStyle('info')}>{r.cmhReference}</span>
                {' · '}
                <span style={badgeStyle(confirmacion.type)}>{confirmacion.type}</span>
                {' · '}
                <span style={badgeStyle('ghost')}>P: {r.panel} · C: {r.col} · F: {r.row}</span>
              </div>
              {r.metric && <div style={{ fontSize: 12, color: 'var(--text-nav)', marginBottom: 2 }}>Métrica: {r.metric}</div>}
              {r.packagingUnit && <div style={{ fontSize: 12, color: 'var(--text-nav)', marginBottom: 2 }}>Ud. embalaje: {r.packagingUnit}</div>}
              {r.pvpOrientativo != null && (
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--success-text)', marginBottom: 2 }}>
                  PVP orientativo: {fmtPrecio(r.pvpOrientativo)}/paquete
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={labelStyle}>Cantidad (paquetes)</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-bright)' }}>
                {(() => {
                  const emb = parseEmbalaje(r.packagingUnit);
                  const paquetes = confirmacion.quantity ?? r.reorderPoint ?? 1;
                  const total = paquetes * emb;
                  if (emb <= 1) return `${paquetes} paquete${paquetes === 1 ? '' : 's'}`;
                  return `${paquetes} paquete${paquetes === 1 ? '' : 's'} × ${emb} uds = ${total} uds`;
                })()}
              </div>
              {r.pvpOrientativo != null && (
                <div style={{ fontSize: 13, color: 'var(--success-text)', fontWeight: 700, marginTop: 4 }}>
                  Total orientativo ({paquetesPedido()} paquetes): {fmtPrecio(paquetesPedido() * r.pvpOrientativo)}
                </div>
              )}
            </div>
            {confirmacion.desiredDeadline && (
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={labelStyle}>Plazo deseado</div>
                <div style={{ fontSize: 14, color: 'var(--text-light)' }}>{confirmacion.desiredDeadline}</div>
              </div>
            )}

            {confirmacion.notes && (
              <div style={{ marginBottom: '1rem', padding: '0.5rem 0.75rem', background: 'var(--bg-card-soft)', borderRadius: 6, border: '1px solid var(--border-soft-2)' }}>
                <div style={labelStyle}>Observaciones</div>
                <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>{confirmacion.notes}</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid var(--border-soft)', paddingTop: '1rem' }}>
              <button style={btnStyle('ghost')} onClick={() => setConfirmacion(null)} disabled={createOrderMut.isPending}>
                Cancelar
              </button>
              <button style={btnStyle(confirmacion.type === 'Solicitud Express' ? 'express' : 'primary')} onClick={ejecutarPedido} disabled={createOrderMut.isPending}>
                {createOrderMut.isPending ? 'Creando...' : 'Confirmar pedido'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={editando} onClose={() => setEditando(false)} title="Editar Product" wide>
        <FormRecambio
          product={r}
          onSave={(updated) => { setEditando(false); onUpdated?.(updated); }}
          onCancel={() => setEditando(false)}
        />
      </Modal>
    </>
  );
}
