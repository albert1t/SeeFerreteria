import { useState, useCallback, useEffect, useRef } from 'react';
import { SwitchCamera, Flashlight, FlashlightOff, CameraOff, ZoomIn, ZoomOut } from 'lucide-react';
import { Modal } from './Modal';
import { btnStyle } from '../styles/theme';
import * as recambiosApi from '../api/products';
import { useQrScanner } from '../hooks/useQrScanner';
import { ReferenceCandidateList } from './ReferenceCandidateList';
import type { Product } from '../types';

interface QrModalProps {
  open: boolean;
  onClose: () => void;
  onFound: (product: Product) => void;
}

const SCAN_COOLDOWN_MS = 2500;
const QR_BOX_SIZE = 220;

export function QrModal({ open, onClose, onFound }: QrModalProps) {
  const [manualRef, setManualRef] = useState('');
  const [lookupRef, setLookupRef] = useState('');
  const [candidates, setCandidates] = useState<Product[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const stopCameraRef = useRef<() => void>(() => undefined);

  const lookupCandidates = useCallback(async (ref: string) => {
    const trimmed = ref.trim();
    setLookupRef(trimmed);
    setCandidates([]);
    setLookupError('');
    if (trimmed.length < 2) {
      setLookupError('Introduce o escanea al menos 2 caracteres.');
      return;
    }

    setLookupLoading(true);
    try {
      setCandidates(await recambiosApi.getReferenceCandidates(trimmed));
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'No se pudo consultar el catálogo.');
    } finally {
      setLookupLoading(false);
    }
  }, []);

  const handleScan = useCallback(async (text: string) => {
    setManualRef(text);
    stopCameraRef.current();
    await lookupCandidates(text);
  }, [lookupCandidates]);

  const {
    videoRef,
    cameraState,
    errorMsg,
    startCamera,
    switchCamera,
    toggleTorch,
    torchSupported,
    torchOn,
    zoomRange,
    zoom,
    changeZoom,
    hasMultipleCameras,
    stopCamera,
  } = useQrScanner({ onScan: handleScan, cooldownMs: SCAN_COOLDOWN_MS, autoStart: open });
  useEffect(() => {
    stopCameraRef.current = stopCamera;
  }, [stopCamera]);

  const handleClose = useCallback(() => {
    setManualRef('');
    setLookupRef('');
    setCandidates([]);
    setLookupError('');
    onClose();
  }, [onClose]);

  const handleManual = useCallback(() => {
    stopCamera();
    void lookupCandidates(manualRef);
  }, [lookupCandidates, manualRef, stopCamera]);

  const handleSelect = useCallback((product: Product) => {
    onFound(product);
    handleClose();
  }, [onFound, handleClose]);

  const scanAnother = useCallback(() => {
    setManualRef('');
    setLookupRef('');
    setCandidates([]);
    setLookupError('');
    void startCamera();
  }, [startCamera]);

  return (
    <Modal open={open} onClose={handleClose} title="Búsqueda por QR / Referencia">
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 0 }}>
        Escanea el QR con la cámara o introduce la referencia manualmente:
      </p>

      <div style={{
        position: 'relative', marginBottom: '1rem', borderRadius: 8, overflow: 'hidden',
        background: '#000', minHeight: 240,
      }}>
        <video
          ref={videoRef}
          style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }}
          playsInline
          muted
        />

        {cameraState === 'active' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{
              width: QR_BOX_SIZE, height: QR_BOX_SIZE, border: '3px solid rgba(255,255,255,0.7)', borderRadius: 12,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: 'var(--accent)', borderRadius: 2, animation: 'qr-scan-line 2s ease-in-out infinite',
              }} />
            </div>
          </div>
        )}

        {cameraState === 'loading' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8, color: '#fff', fontSize: 13,
          }}>
            <div style={{
              width: 28, height: 28, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite',
            }} />
            Abriendo cámara...
          </div>
        )}

        {cameraState === 'error' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20, textAlign: 'center',
          }}>
            <CameraOff size={40} color="#fff" opacity={0.6} />
            <p style={{ color: '#fff', fontSize: 13, margin: 0, lineHeight: 1.4 }}>{errorMsg}</p>
            <button
              style={{ ...btnStyle('primary'), fontSize: 12, padding: '6px 16px' }}
              onClick={() => startCamera()}
            >
              Reintentar
            </button>
          </div>
        )}

        {cameraState === 'idle' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.5)', fontSize: 13,
          }}>
            {lookupRef ? 'Referencia recibida' : 'Preparando cámara...'}
          </div>
        )}

        {(cameraState === 'active' || cameraState === 'loading') && (
          <div style={{
            position: 'absolute', top: 8, right: 8, display: 'flex', gap: 8, pointerEvents: 'auto', zIndex: 2,
          }}>
            {torchSupported && (
              <button
                type="button"
                onClick={toggleTorch}
                title={torchOn ? 'Apagar linterna' : 'Encender linterna'}
                style={{
                  width: 36, height: 36, borderRadius: '50%', border: 'none',
                  background: 'rgba(0,0,0,0.5)', color: '#fff', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}
              >
                {torchOn ? <FlashlightOff size={18} /> : <Flashlight size={18} />}
              </button>
            )}
            {zoomRange && (
              <>
                <button
                  type="button"
                  onClick={() => void changeZoom(zoom - zoomRange.step)}
                  title="Alejar"
                  aria-label="Alejar cámara"
                  style={{
                    width: 36, height: 36, borderRadius: '50%', border: 'none',
                    background: 'rgba(0,0,0,0.5)', color: '#fff', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => void changeZoom(zoom + zoomRange.step)}
                  title="Acercar"
                  aria-label="Acercar cámara"
                  style={{
                    width: 36, height: 36, borderRadius: '50%', border: 'none',
                    background: 'rgba(0,0,0,0.5)', color: '#fff', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}
                >
                  <ZoomIn size={18} />
                </button>
              </>
            )}
            {hasMultipleCameras && (
              <button
                type="button"
                onClick={switchCamera}
                title="Cambiar cámara trasera"
                style={{
                  width: 36, height: 36, borderRadius: '50%', border: 'none',
                  background: 'rgba(0,0,0,0.5)', color: '#fff', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}
              >
                <SwitchCamera size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{
          fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase',
          display: 'block', marginBottom: 4,
        }}>
          Referencia CMH o Cliente
        </label>
        <input
          value={manualRef}
          onChange={(e) => setManualRef(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleManual()}
          placeholder="CMH00001 o CLI-000001"
          inputMode="text"
          autoComplete="off"
          style={{
            width: '100%', padding: '9px 12px', background: 'var(--bg-input)',
            border: '1px solid var(--border-input)', borderRadius: 8, color: 'var(--text)', fontSize: 14,
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btnStyle('primary')} onClick={handleManual}>
          Buscar
        </button>
        {lookupRef && !lookupLoading && (
          <button style={btnStyle('ghost')} onClick={scanAnother}>
            Escanear otro QR
          </button>
        )}
        <button style={btnStyle('ghost')} onClick={handleClose}>Cancelar</button>
      </div>
      <ReferenceCandidateList
        scannedRef={lookupRef}
        products={candidates}
        loading={lookupLoading}
        error={lookupError}
        onSelect={handleSelect}
      />

      <style>{`
        @keyframes qr-scan-line {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(${QR_BOX_SIZE - 3}px); opacity: 0.6; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Modal>
  );
}
