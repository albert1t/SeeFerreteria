import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { btnStyle, colors } from '../styles/theme';
import * as importacionesApi from '../api/imports';

const FESTO_MARCA = 'festo';
const OBsolescencia_DIAS = 180;

const PASOS = [
  { num: 1, titulo: 'Iniciar sesión', desc: 'Inicia sesión en la Festo Online Shop con tu cuenta de empresa.' },
  { num: 2, titulo: 'Net Price List', desc: "Navega a la sección 'Net Price List' desde el menú de descargas." },
  { num: 3, titulo: 'Configurar CSV', desc: 'Configura la exportación en CSV incluyendo referencias y precio neto.' },
  { num: 4, titulo: 'Descargar', desc: 'Descarga el archivo y súbelo aquí para actualizar los PVP orientativos.' },
];

export function FestoImportPage() {
  const { can } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [obsoletoDescartado, setObsoletoDescartado] = useState(false);

  const puedeEditar = can('tarifas', 'edit');

  const { data: status } = useQuery({
    queryKey: ['imports', FESTO_MARCA, 'status'],
    queryFn: () => importacionesApi.getImportacionStatus(FESTO_MARCA),
    refetchInterval: 30_000,
  });

  const importarMut = useMutation({
    mutationFn: (f: File) => importacionesApi.importCatalog(FESTO_MARCA, f),
    onSuccess: (data) => {
      const { importacion } = data;
      const fallido = importacion.status === 'fallido';
      setResult({
        ok: !fallido,
        message: fallido
          ? `No se actualizó ningún producto. ${importacion.errors > 0 ? `Se descartaron ${importacion.errors} filas inválidas.` : 'Ningún código del CSV coincide con un producto existente.'}`
          : `Importación completada: ${importacion.updated} productos updated de ${importacion.totalRecords} filas leídas${importacion.errors > 0 ? ` (${importacion.errors} filas descartadas)` : ''}.`,
      });
      setFile(null);
      showToast(
        fallido ? 'No se actualizó ningún precio' : 'Catálogo importado correctamente',
        fallido ? 'error' : 'success',
      );
    },
    onError: (err: Error) => {
      setResult({ ok: false, message: err.message });
      showToast(err.message, 'error');
    },
  });

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selected = files[0];
    if (!/\.(csv|txt)$/i.test(selected.name)) {
      setResult({ ok: false, message: 'El archivo debe tener extensión .csv o .txt' });
      return;
    }
    setFile(selected);
    setResult(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  function handleSubmit() {
    if (!file) return;
    setResult(null);
    importarMut.mutate(file);
  }

  const dias = status?.diasDesdeUltima ?? null;
  const obsoleto = dias !== null && dias > OBsolescencia_DIAS;

  useEffect(() => {
    if (obsoleto && !obsoletoDescartado) {
      showToast(
        'La tarifa de precios de Festo tiene más de 6 meses de antigüedad. Por favor, importa un nuevo CSV para mantener los PVP orientativos al día.',
        'info',
      );
    }
  }, [obsoleto, obsoletoDescartado, showToast]);

  if (!puedeEditar) {
    return (
      <div style={{ padding: '2rem', color: colors.textMuted, textAlign: 'center' }}>
        No tienes permisos para acceder a esta página.
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', color: colors.text, height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>Importar tarifa Festo</h2>
        {dias !== null && (
          <div style={{ fontSize: 13, color: obsoleto ? 'var(--danger-text)' : colors.textMuted }}>
            Última importación: {dias === 0 ? 'hoy' : `hace ${dias} días`}
            {status?.ultimaImportacion && (
              <span style={{ marginLeft: 8, opacity: 0.7 }}>({new Date(status.ultimaImportacion).toLocaleDateString('es-ES')})</span>
            )}
          </div>
        )}
      </div>

      {obsoleto && !obsoletoDescartado && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: '1.25rem',
          padding: '0.75rem 1rem',
          background: 'var(--bg-danger-soft)',
          border: '1px solid var(--border-danger-strong)',
          borderRadius: 8,
          color: 'var(--danger-text)',
          fontSize: 13,
        }}>
          <span>La tarifa de precios de Festo tiene más de 6 meses de antigüedad. Por favor, importa un nuevo CSV para mantener los PVP orientativos al día.</span>
          <button
            type="button"
            onClick={() => setObsoletoDescartado(true)}
            style={{
              background: 'none', border: 'none', color: 'var(--danger-text)', cursor: 'pointer',
              fontSize: 16, lineHeight: 1, padding: 2, flexShrink: 0,
            }}
            title="Descartar"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tutorial section */}
      <div style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: '1.25rem',
        marginBottom: '1.25rem',
      }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: 16, color: colors.accent }}>Instrucciones de descarga</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {PASOS.map((paso) => (
            <div key={paso.num} style={{
              background: 'var(--bg-table-head)',
              borderRadius: 10,
              padding: 12,
              border: `1px solid ${colors.border}`,
            }}>
              <img
                src={`/assets/placeholder-festo-${paso.num}.jpg`}
                alt={`Paso ${paso.num}`}
                style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6, marginBottom: 10, background: 'var(--bg-elevated-2)' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%', background: colors.accentDark,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                }}>
                  {paso.num}
                </span>
                <strong style={{ fontSize: 14 }}>{paso.titulo}</strong>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: colors.textMuted, lineHeight: 1.4 }}>{paso.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upload section */}
      <div style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: '1.25rem',
      }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: 16, color: colors.accent }}>Subir CSV</h3>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? colors.accent : colors.border}`,
            borderRadius: 12,
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? 'var(--bg-accent-soft)' : 'var(--bg-input-dark)',
            transition: 'all 0.2s',
            marginBottom: '1rem',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div style={{ fontSize: 40, marginBottom: 8 }}>📄</div>
          {file ? (
            <div>
              <div style={{ fontWeight: 600, color: colors.accent }}>{file.name}</div>
              <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
                {(file.size / 1024).toFixed(1)} KB
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 14, color: colors.text }}>Arrastra un archivo CSV aquí o haz clic para seleccionar</div>
              <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 6 }}>Solo archivos .csv o .txt</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            style={{ ...btnStyle('primary'), opacity: !file || importarMut.isPending ? 0.6 : 1 }}
            disabled={!file || importarMut.isPending}
            onClick={handleSubmit}
          >
            {importarMut.isPending ? 'Importando...' : 'Importar catálogo'}
          </button>
          {file && (
            <button type="button" style={btnStyle('ghost')} onClick={() => { setFile(null); setResult(null); }}>
              Cancelar
            </button>
          )}
        </div>

        {importarMut.isPending && (
          <div style={{ marginTop: '1rem', color: colors.textMuted, fontSize: 13 }}>
            Procesando archivo en stream por chunks de 1000 registros. Esto puede tardar unos segundos…
          </div>
        )}

        {result && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: 8,
            fontSize: 13,
            background: result.ok ? 'var(--bg-success-soft)' : 'var(--bg-danger-soft)',
            border: `1px solid ${result.ok ? 'var(--success)' : 'var(--border-danger-strong)'}`,
            color: result.ok ? 'var(--success-text)' : 'var(--danger-text)',
          }}>
            {result.ok ? '✓ ' : '✗ '}{result.message}
          </div>
        )}
      </div>
    </div>
  );
}
