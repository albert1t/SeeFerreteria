import type { Product } from '../types';

function candidateLabel(scannedRef: string, product: Product): string {
  const scanned = scannedRef.trim().toUpperCase();
  const references = [product.cmhReference, product.customerReference]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.trim().toUpperCase());

  if (references.includes(scanned)) return 'Coincidencia exacta';
  if (references.some((value) => value.startsWith(scanned) || scanned.startsWith(value))) {
    return 'Coincidencia parcial';
  }
  return 'Posible diferencia inicial';
}

export function ReferenceCandidateList({
  scannedRef,
  products,
  loading,
  error,
  onSelect,
}: {
  scannedRef: string;
  products: Product[];
  loading: boolean;
  error: string;
  onSelect: (product: Product) => void;
}) {
  if (!scannedRef) return null;

  return (
    <section aria-live="polite" style={{ marginTop: 12 }}>
      <div style={{ fontSize: 13, marginBottom: 8, color: 'var(--text-muted)' }}>
        Texto leído/introducido: <strong style={{ color: 'var(--text)' }}>{scannedRef}</strong>
      </div>
      {loading && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Buscando referencias posibles…</p>}
      {!loading && error && <p role="alert" style={{ fontSize: 13, color: 'var(--danger, #dc2626)' }}>{error}</p>}
      {!loading && !error && products.length === 0 && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No hay productos con una referencia coincidente.</p>
      )}
      {!loading && products.length > 0 && (
        <>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 8px' }}>
            Selecciona el producto correcto:
          </p>
          <div style={{ display: 'grid', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
            {products.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => onSelect(product)}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 12px',
                  borderRadius: 8, border: '1px solid var(--border-input)',
                  background: 'var(--bg-input)', color: 'var(--text)', cursor: 'pointer',
                }}
              >
                <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                  <strong>{product.cmhReference}</strong>
                  <small style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {candidateLabel(scannedRef, product)}
                  </small>
                </span>
                <span style={{ display: 'block', fontSize: 13, marginTop: 3 }}>{product.name}</span>
                {product.customerReference && (
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                    Ref. cliente: {product.customerReference}
                  </span>
                )}
                <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                  {product.panel
                    ? `Ubicación: ${product.panel} C${product.col ?? '—'}F${product.row ?? '—'}`
                    : 'Sin ubicación'}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
