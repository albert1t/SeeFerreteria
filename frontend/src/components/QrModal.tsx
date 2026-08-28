import { useState, useEffect, useRef, useCallback } from 'react';
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

function isBackCamera(label: string): boolean {
  const lower = label.toLowerCase();
  return (
    /back|rear|environment|trasera/i.test(lower) &&
    !/front|selfie|user|facetime/i.test(lower)
  );
}

export function QrModal({ open, onClose, onFound }: QrModalProps) {
  const [manualRef, setManualRef] = useState('');
  const [cameraState, setCameraState] = useState<'idle' | 'loading' | 'active' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [backCameras, setBackCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(-1);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<any>(null);
  const scanCooldownRef = useRef<Map<string, number>>(new Map());
  const processingRef = useRef(false);
  const { showToast } = useToast();

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
      stopCamera();
      setManualRef('');
      onFound(product);
      onClose();
    } catch {
      showToast(`Referencia no encontrada: ${trimmed}`);
    } finally {
      processingRef.current = false;
    }
  }, [onFound, onClose, showToast]);

  const stopCamera = useCallback(() => {
    try {
      controlsRef.current?.stop();
    } catch {
      // ignore
    }
    controlsRef.current = null;
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraState('idle');
    setTorchSupported(false);
    setTorchOn(false);
  }, []);

  const applyTrackConstraints = useCallback(async (constraints: MediaTrackConstraintSet) => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    const track = stream?.getVideoTracks()[0];
    if (!track) return false;
    try {
      await track.applyConstraints({ advanced: [constraints] });
      return true;
    } catch {
      return false;
    }
  }, []);

  const detectBackCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = devices.filter((d) => d.kind === 'videoinput');
      const backs = videoDevs.filter((d) => isBackCamera(d.label));
      setBackCameras(backs);
      setHasMultipleCameras(backs.length > 1);
      return backs;
    } catch {
      setBackCameras([]);
      setHasMultipleCameras(false);
      return [];
    }
  }, []);

  const startCamera = useCallback(async (deviceId?: string) => {
    if (!videoRef.current) return;
    stopCamera();
    setCameraState('loading');
    setErrorMsg('');

    try {
      const constraints: MediaStreamConstraints = deviceId
        ? {
            video: {
              deviceId: { exact: deviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          }
        : {
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (!videoRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      // Try continuous autofocus
      await applyTrackConstraints({ focusMode: 'continuous' } as MediaTrackConstraintSet);

      // Check torch support
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() as MediaTrackCapabilities | undefined;
      if (capabilities && 'torch' in capabilities) {
        setTorchSupported(true);
      }

      const { BrowserQRCodeReader } = await import('@zxing/browser');
      const reader = new BrowserQRCodeReader();
      const controls = await reader.decodeFromVideoElement(videoRef.current, (result: { getText(): string } | null | undefined) => {
        if (result) {
          const text = result.getText();
          if (text) handleRef(text);
        }
      });
      controlsRef.current = controls;
      setCameraState('active');

      // After permission is granted, enumerate back cameras for the switch button
      const backs = await detectBackCameras();
      if (backs.length > 1 && deviceId) {
        const idx = backs.findIndex((c) => c.deviceId === deviceId);
        setCurrentCameraIndex(idx >= 0 ? idx : 0);
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
  }, [handleRef, stopCamera, applyTrackConstraints, detectBackCameras]);

  const switchCamera = useCallback(async () => {
    if (cameraState === 'loading' || backCameras.length < 2) return;
    const nextIndex = (currentCameraIndex + 1) % backCameras.length;
    setCurrentCameraIndex(nextIndex);
    stopCamera();
    setTimeout(() => startCamera(backCameras[nextIndex].deviceId), 300);
  }, [cameraState, backCameras, currentCameraIndex, stopCamera, startCamera]);

  const toggleTorch = useCallback(async () => {
    const next = !torchOn;
    const ok = await applyTrackConstraints({ torch: next } as MediaTrackConstraintSet);
    if (ok) setTorchOn(next);
  }, [torchOn, applyTrackConstraints]);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setManualRef('');
      setErrorMsg('');
      setBackCameras([]);
      setCurrentCameraIndex(-1);
      setHasMultipleCameras(false);
      scanCooldownRef.current.clear();
      return;
    }

    const timer = setTimeout(() => startCamera(), 300);

    return () => {
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
            Preparando cámara...
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
