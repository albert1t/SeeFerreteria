import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { btnStyle } from '../styles/theme';
import { useToast } from './Toast';
import * as recambiosApi from '../api/recambios';
import * as catalogosApi from '../api/catalogos';
import type { Recambio, RecambioFormData } from '../types';

interface FormRecambioProps {
  recambio?: Recambio;
  onSave: (r: Recambio) => void;
  onCancel: () => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(77,184,255,0.25)', borderRadius: 8, color: '#e8eef6', fontSize: 14, boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, color: '#7aade0', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4, display: 'block',
};

export function FormRecambio({ recambio, onSave, onCancel }: FormRecambioProps) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: familias = [] } = useQuery({
    queryKey: ['catalogos', 'familias'],
    queryFn: catalogosApi.getFamilias,
  });

  const [form, setForm] = useState<RecambioFormData>({
    referenciaCMH: recambio?.referenciaCMH ?? '',
    referenciaCliente: recambio?.referenciaCliente ?? '',
    codigo: recambio?.codigo ?? '',
    nombre: recambio?.nombre ?? '',
    marca: recambio?.marca ?? '',
    descripcion: recambio?.descripcion ?? '',
    metrica: recambio?.metrica ?? '',
    unidadEmbalaje: recambio?.unidadEmbalaje ?? 'Unidad',
    imagen: recambio?.imagen ?? '',
    plazoEntrega: recambio?.plazoEntrega ?? '',
    familiaId: recambio?.familiaId ?? familias[0]?.id ?? 1,
    nReposicion: recambio?.nReposicion ?? null,
    panel: recambio?.panel ?? 'A1',
    col: recambio?.col ?? 1,
    row: recambio?.row ?? 1,
  });

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(form.imagen || null);

  const saveMut = useMutation({
    mutationFn: () =>
      recambio
        ? recambiosApi.updateRecambio(recambio.id, form)
        : recambiosApi.createRecambio(form),
    onSuccess: (r) => {
      showToast(recambio ? 'Recambio actualizado' : 'Recambio creado', 'success');
      queryClient.invalidateQueries({ queryKey: ['recambios'] });
      queryClient.invalidateQueries({ queryKey: ['paneles'] });
      onSave(r);
    },
    onError: (err: Error) => showToast(err.message),
  });

  function upd<K extends keyof RecambioFormData>(key: K, value: RecambioFormData[K]) {
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
      upd('imagen', url);
      setPreviewUrl(url);
      showToast('Imagen subida correctamente', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al subir imagen');
      setPreviewUrl(form.imagen || null);
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleRemoveImage() {
    upd('imagen', '');
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // Determinar el tamaño del panel, de A1-A9{6X15}, el resto {5X10} cubetas
  const panelLimits = (() => {
    const match = form.panel.trim().toUpperCase().match(/^A(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num >= 1 && num <= 9) {
        return { cols: 6, rows: 15 };
      }
    }
    return { cols: 5, rows: 10 };
  })();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
      {([['referenciaCMH', 'Ref. CMH *'], ['referenciaCliente', 'Ref. Cliente'], ['codigo', 'Código'], ['nombre', 'Nombre *'], ['marca', 'Marca']] as const).map(([k, lbl]) => (
        <div key={k}>
          <label style={labelStyle}>{lbl}</label>
          <input style={inputStyle} value={(form[k] as string) ?? ''} onChange={(e) => upd(k, e.target.value)} />
        </div>
      ))}
      <div style={{ gridColumn: '1/-1' }}>
        <label style={labelStyle}>Descripción</label>
        <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.descripcion ?? ''} onChange={(e) => upd('descripcion', e.target.value)} />
      </div>
      <div>
        <label style={labelStyle}>Métrica</label>
        <input style={inputStyle} value={form.metrica ?? ''} onChange={(e) => upd('metrica', e.target.value)} placeholder='Ej: M8x30, 1/2", 35mm²' />
      </div>
      {([['unidadEmbalaje', 'Unidad de embalaje'], ['plazoEntrega', 'Plazo de entrega']] as const).map(([k, lbl]) => (
        <div key={k}>
          <label style={labelStyle}>{lbl}</label>
          <input style={inputStyle} value={(form[k] as string) ?? ''} onChange={(e) => upd(k, e.target.value)} />
        </div>
      ))}

      <div>
        <label style={labelStyle}>Familia</label>
        <select
          style={inputStyle}
          value={form.familiaId}
          onChange={(e) => upd('familiaId', parseInt(e.target.value, 10))}
        >
          {familias.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}
        </select>
      </div>
      <div>
        <label style={labelStyle}>N° Reposición</label>
        <input style={inputStyle} type="number" min="1" value={form.nReposicion ?? ''} onChange={(e) => { const v = e.target.value; upd('nReposicion', v === '' ? null : parseInt(v, 10)); }} />
      </div>
      <div>
        <label style={labelStyle}>Panel</label>
        <input style={inputStyle} value={form.panel} onChange={(e) => upd('panel', e.target.value.toUpperCase())} placeholder="Ej: A1" />
      </div>
      <div>
        <label style={labelStyle}>Columna (1-{panelLimits.cols})</label>
        <input style={inputStyle} type="number" min="1" max={panelLimits.cols} value={form.col} onChange={(e) => upd('col', parseInt(e.target.value, 10))} />
      </div>
      <div>
        <label style={labelStyle}>Fila (1-{panelLimits.rows})</label>
        <input style={inputStyle} type="number" min="1" max={panelLimits.rows} value={form.row} onChange={(e) => upd('row', parseInt(e.target.value, 10))} />
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
            {uploading ? 'Subiendo...' : 'Seleccionar imagen'}
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
            border: '1px solid rgba(77,184,255,0.2)',
            background: 'rgba(0,0,0,0.2)',
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
      <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(42,80,128,0.3)' }}>
        <button style={btnStyle('ghost')} onClick={onCancel}>Cancelar</button>
        <button
          style={btnStyle('primary')}
          disabled={saveMut.isPending || uploading || !form.referenciaCMH || !form.nombre}
          onClick={() => saveMut.mutate()}
        >
          {saveMut.isPending ? 'Guardando...' : recambio ? 'Guardar cambios' : 'Crear recambio'}
        </button>
      </div>
    </div>
  );
}
