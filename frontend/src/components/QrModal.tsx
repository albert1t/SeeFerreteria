import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode, type CameraDevice } from 'html5-qrcode';
import { SwitchCamera, Flashlight, FlashlightOff, CameraOff } from 'lucide-react';
import { Modal } from './Modal';
import { btnStyle } from '../styles/theme';
import * as recambiosApi from '../api/products';
import { useToast } from './Toast';
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
  const [cameraState, setCameraState] = useState<'idle' | 'loading' | 'active' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanCooldownRef = useRef<Map<string, number>>(new Map());
  const processingRef = useRef(false);
  const facingModeRef = useRef(facingMode);
  const { showToast } = useToast();

  useEffect(() => {
    facingModeRef.current = facingMode;
  }, [facingMode]);

  const stopCamera = useCallback(async () => {
    try {
      await scannerRef.current?.stop();
    } catch {
      // ignore stop errors
    }
    scannerRef.current = null;
    setCameraState('idle');
    setTorchSupported(false);
    setTorchOn(false);
  }, []);

  const handleRef = useCallback(async (ref: string) => {
    const trimmed = ref.trim();
    if (!trimmed || processingRef.current) return;

    const now = Date.now();
    const lastScan = scanCooldownRef.current.get(trimmed);
    if (lastScan && now - lastScan < SCAN_COOLDOWN_MS) return;

    processingRef.current = true;
    scanCooldownRef.current.set(trimmed, now);

    try {
      const product = await recambiosApi.getRecambioByRef(trimmed);
      await stopCamera();
      setManualRef('');
      onFound(product);
      onClose();
    } catch {
      showToast(`Referencia no encontrada: ${trimmed}`);
    } finally {
      processingRef.current = false;
    }
  }, [onFound, onClose, stopCamera, showToast]);

  const applyVideoConstraints = useCallback(async (constraints: MediaTrackConstraintSet) => {
    try {
      await scannerRef.current?.applyVideoConstraints(constraints);
      return true;
    } catch {
      return false;
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (scannerRef.current) {
      await stopCamera();
    }

    setCameraState('loading');
    setErrorMsg('');

    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      const config = {
        fps: 10,
        qrbox: { width: QR_BOX_SIZE, height: QR_BOX_SIZE },
        aspectRatio: 1.0,
        disableFlip: false,
      };

      const mode = facingModeRef.current;
      // ideal for initial start, exact when the user explicitly toggles
      const cameraConfig: MediaTrackConstraints = {
        facingMode: mode === 'environment' ? { ideal: 'environment' } : { exact: 'user' },
      };

      await scanner.start(
        cameraConfig,
        config,
        (decodedText) => {
          if (decodedText) {
            handleRef(decodedText);
          }
        },
        () => {
          // ignore frame errors
        },
      );

      setCameraState('active');

      // Try to enable continuous autofocus; ignore if unsupported
      await applyVideoConstraints({ advanced: [{ focusMode: 'continuous' }] } as MediaTrackConstraintSet);

      // Check torch support
      const capabilities = scanner.getRunningTrackCapabilities?.() as MediaTrackCapabilities | undefined;
      if (capabilities && 'torch' in capabilities) {
        setTorchSupported(true);
      }
    } catch (err: unknown) {
      let message = 'No se pudo acceder a la cámara';
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          message = 'Permiso de cámara denegado. Habilita el acceso en la configuración del navegador.';
        } else if (err.name === 'NotFoundError') {
          message = 'No se encontró ninguna cámara en este dispositivo.';
        } else if (err.name === 'NotReadableError') {
          message = 'La cámara está siendo usada por otra aplicación.';
        } else if (err.name === 'OverconstrainedError') {
          message = 'La cámara no soporta la configuración solicitada.';
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      setErrorMsg(message);
      setCameraState('error');
    }
  }, [stopCamera, handleRef, applyVideoConstraints]);

  const toggleTorch = useCallback(async () => {
    const next = !torchOn;
    const ok = await applyVideoConstraints({ advanced: [{ torch: next }] } as MediaTrackConstraintSet);
    if (ok) {
      setTorchOn(next);
    }
  }, [torchOn, applyVideoConstraints]);

  const switchFacingMode = useCallback(async () => {
    if (cameraState === 'loading') return;
    const next = facingModeRef.current === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    facingModeRef.current = next;
    await stopCamera();
    setTimeout(() => startCamera(), 400);
  }, [cameraState, stopCamera, startCamera]);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setManualRef('');
      setErrorMsg('');
      scanCooldownRef.current.clear();
      return;
    }

    let cancelled = false;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (cancelled) return;
        setCameras(devices);
        const hasBack = devices.some((d) => /back|rear|environment/i.test(d.label));
        if (hasBack) {
          setFacingMode('environment');
          facingModeRef.current = 'environment';
        }
      })
      .catch(() => {
        if (cancelled) return;
        setCameras([]);
      });

    const timer = setTimeout(() => startCamera(), 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      stopCamera();
    };
  }, [open, startCamera, stopCamera]);

  return (
    <Modal open={open} onClose={onClose} title="Búsqueda por QR / Referencia">
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 0 }}>
        Escanea el QR con la cámara o introduce la referencia manualmente:
      </p>

      <div style={{
        position: 'relative', marginBottom: '1rem', borderRadius: 8, overflow: 'hidden',
        background: '#000', minHeight: 240,
      }}>
        <div id="qr-reader" style={{ width: '100%', minHeight: 240 }} />

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
              onClick={startCamera}
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
            Preparando cámara...
          </div>
        )}

        {(cameraState === 'active' || cameraState === 'loading') && cameras.length > 1 && (
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
            <button
              type="button"
              onClick={switchFacingMode}
              title="Cambiar cámara"
              style={{
                width: 36, height: 36, borderRadius: '50%', border: 'none',
                background: 'rgba(0,0,0,0.5)', color: '#fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <SwitchCamera size={18} />
            </button>
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
          onKeyDown={(e) => e.key === 'Enter' && handleRef(manualRef)}
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
        <button style={btnStyle('primary')} onClick={() => handleRef(manualRef)}>
          Buscar
        </button>
        <button style={btnStyle('ghost')} onClick={onClose}>Cancelar</button>
      </div>

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
