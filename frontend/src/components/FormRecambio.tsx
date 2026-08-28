import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { btnStyle } from '../styles/theme';
import { useToast } from './Toast';
import * as recambiosApi from '../api/products';
import * as catalogosApi from '../api/catalogs';
import type { Product, ProductFormData } from '../types';

interface FormRecambioProps {
  product?: Product;
  prefilledPosition?: { panel: string; col: number; row: number } | null;
  onSave: (r: Product) => void;
  onCancel: () => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', background: 'var(--bg-input)',
  border: '1px solid var(--border-input)', borderRadius: 8, color: 'var(--text)', fontSize: 14, boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4, display: 'block',
};

export function FormRecambio({ product, prefilledPosition, onSave, onCancel }: FormRecambioProps) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: families = [] } = useQuery({
    queryKey: ['catalogs', 'families'],
    queryFn: catalogosApi.getFamilies,
  });

  const [form, setForm] = useState<ProductFormData>({
    cmhReference: product?.cmhReference ?? '',
    customerReference: product?.customerReference ?? '',
    code: product?.code ?? '',
    name: product?.name ?? '',
    brand: product?.brand ?? '',
    description: product?.description ?? '',
    metric: product?.metric ?? '',
    packagingUnit: product?.packagingUnit ?? '',
    image: product?.image ?? '',
    deliveryTime: product?.deliveryTime ?? '',
    familyId: product?.familyId ?? 0,
    reorderPoint: product?.reorderPoint ?? null,
    panel: product?.panel ?? prefilledPosition?.panel ?? '',
    col: product?.col ?? prefilledPosition?.col ?? null,
    row: product?.row ?? prefilledPosition?.row ?? null,
    hidden: product?.hidden ?? false,
  });

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(form.image || null);

  const saveMut = useMutation({
    mutationFn: () =>
      product
        ? recambiosApi.updateProduct(product.id, form)
        : recambiosApi.createProduct(form),
    onSuccess: (r) => {
      showToast(product ? 'Producto actualizado' : 'Producto creado', 'success');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['panels'] });
      onSave(r);
    },
    onError: (err: Error) => showToast(err.message),
  });

  function upd<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    // Upload to server
    setUploading(true);
    try {
      const { url } = await recambiosApi.uploadImagen(file);
      upd('image', url);
      setPreviewUrl(url);
      showToast('Imagen subida correctamente', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al subir image');
      setPreviewUrl(form.image || null);
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleRemoveImage() {
    upd('image', '');
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // Determinar el tamaño del panel, de A1-A9{6X15}, el resto {5X10} cubetas
  const panelLimits = (() => {
    const p = form.panel ?? '';
    const match = p.trim().toUpperCase().match(/^A(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num >= 1 && num <= 9) {
        return { cols: 6, rows: 15 };
      }
    }
    return { cols: 5, rows: 10 };
  })();

  const isPositionFixed = !!prefilledPosition;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
      {([['cmhReference', 'Ref. CMH *'], ['customerReference', 'Ref. Cliente'], ['code', 'Código'], ['name', 'Nombre *'], ['brand', 'Marca']] as const).map(([k, lbl]) => (
        <div key={k}>
          <label style={labelStyle}>{lbl}</label>
          <input style={inputStyle} value={(form[k] as string) ?? ''} onChange={(e) => upd(k, e.target.value)} />
        </div>
      ))}
      <div style={{ gridColumn: '1/-1' }}>
        <label style={labelStyle}>Descripción</label>
        <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.description ?? ''} onChange={(e) => upd('description', e.target.value)} />
      </div>
      <div>
        <label style={labelStyle}>Métrica</label>
        <input style={inputStyle} value={form.metric ?? ''} onChange={(e) => upd('metric', e.target.value)} placeholder='Ej: M8x30, 1/2", 35mm²' />
      </div>
      {([['packagingUnit', 'Unidad de embalaje *'], ['deliveryTime', 'Plazo de entrega']] as const).map(([k, lbl]) => (
        <div key={k}>
          <label style={labelStyle}>{lbl}</label>
          <input style={inputStyle} value={(form[k] as string) ?? ''} onChange={(e) => upd(k, e.target.value)} placeholder={k === 'packagingUnit' ? 'Ej: Unidad' : undefined} />
        </div>
      ))}

      <div>
        <label style={labelStyle}>Family *</label>
        <select
          style={inputStyle}
          value={form.familyId}
          onChange={(e) => upd('familyId', parseInt(e.target.value, 10))}
        >
          <option value={0} disabled>-- Seleccionar --</option>
          {families.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>
      <div>
        <label style={labelStyle}>N° Reposición</label>
        <input style={inputStyle} type="number" min="1" value={form.reorderPoint ?? ''} onChange={(e) => { const v = e.target.value; upd('reorderPoint', v === '' ? null : parseInt(v, 10)); }} />
      </div>

      {!isPositionFixed ? (
        <>
          <div>
            <label style={labelStyle}>Panel</label>
            <input style={inputStyle} value={form.panel ?? ''} onChange={(e) => upd('panel', e.target.value.toUpperCase() || null)} placeholder="Ej: A1 (opcional)" />
          </div>
          <div>
            <label style={labelStyle}>Columna (1-{panelLimits.cols})</label>
            <input style={inputStyle} type="number" min="1" max={panelLimits.cols} value={form.col ?? ''} onChange={(e) => { const v = e.target.value; upd('col', v === '' ? null : parseInt(v, 10)); }} placeholder="Opcional" />
          </div>
          <div>
            <label style={labelStyle}>Fila (1-{panelLimits.rows})</label>
            <input style={inputStyle} type="number" min="1" max={panelLimits.rows} value={form.row ?? ''} onChange={(e) => { const v = e.target.value; upd('row', v === '' ? null : parseInt(v, 10)); }} placeholder="Opcional" />
          </div>
        </>
      ) : (
        <div style={{ gridColumn: '1/-1', padding: '8px 12px', background: 'var(--bg-accent-faint)', borderRadius: 8, border: '1px solid var(--border-accent-soft)', fontSize: 13, color: 'var(--accent)' }}>
          Ubicacion: {prefilledPosition.panel} / Col {prefilledPosition.col} / Fila {prefilledPosition.row}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, gridColumn: '1/-1' }}>
        <input
          id="hidden-check"
          type="checkbox"
          checked={form.hidden}
          onChange={(e) => upd('hidden', e.target.checked)}
          style={{ width: 18, height: 18, accentColor: 'var(--accent)' }}
        />
        <label htmlFor="hidden-check" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
          Producto oculto
        </label>
      </div>
      {/* Image upload section */}
      <div style={{ gridColumn: '1/-1' }}>
        <label style={labelStyle}>Imagen</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              ...btnStyle('primary'),
              fontSize: 13,
              padding: '8px 16px',
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? 'Subiendo...' : 'Seleccionar image'}
          </button>
          {previewUrl && (
            <button
              type="button"
              onClick={handleRemoveImage}
              style={{
                ...btnStyle('danger'),
                fontSize: 12,
                padding: '6px 12px',
              }}
            >
              ✕ Quitar
            </button>
          )}
        </div>
        {previewUrl && (
          <div style={{
            marginTop: 10,
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid var(--border-input-soft)',
            background: 'var(--bg-input-dark)',
            maxWidth: 280,
          }}>
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                width: '100%',
                maxHeight: 200,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        )}
      </div>
      <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-soft)' }}>
        <button style={btnStyle('ghost')} onClick={onCancel}>Cancelar</button>
        <button
          style={btnStyle('primary')}
          disabled={saveMut.isPending || uploading || !form.cmhReference || !form.name || !form.familyId || !(form.packagingUnit ?? '').trim()}
          onClick={() => saveMut.mutate()}
        >
          {saveMut.isPending ? 'Guardando...' : product ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </div>
    </div>
  );
}
