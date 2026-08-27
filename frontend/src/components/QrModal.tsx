import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
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

export function QrModal({ open, onClose, onFound }: QrModalProps) {
  const [manualRef, setManualRef] = useState('');
  const [cameraState, setCameraState] = useState<'idle' | 'loading' | 'active' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const { showToast } = useToast();

  const stopCamera = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    readerRef.current = null;
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const handleRef = useCallback(async (ref: string) => {
    const trimmed = ref.trim();
    if (!trimmed) return;
    try {
      const product = await recambiosApi.getRecambioByRef(trimmed);
      stopCamera();
      onFound(product);
      onClose();
      setManualRef('');
    } catch {
      showToast(`Referencia no encontrada: ${trimmed}`);
    }
  }, [onFound, onClose, stopCamera, showToast]);

  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;

    stopCamera();
    setCameraState('loading');
    setErrorMsg('');

    try {
      const reader = new BrowserQRCodeReader();
      readerRef.current = reader;

      const constraints: MediaStreamConstraints = {
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

      const controls = await reader.decodeFromVideoElement(videoRef.current, (result) => {
        if (result) {
          const text = result.getText();
          if (text) {
            handleRef(text);
          }
        }
      });

      controlsRef.current = controls;
      setCameraState('active');
    } catch (err: unknown) {
      let message = 'No se pudo acceder a la camara';
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          message = 'Permiso de camara denegado. Habilita el acceso en la configuracion del navegador.';
        } else if (err.name === 'NotFoundError') {
          message = 'No se encontro ninguna camara en este dispositivo.';
        } else if (err.name === 'NotReadableError') {
          message = 'La camara esta siendo usada por otra aplicacion.';
        } else if (err.name === 'OverconstrainedError') {
          message = 'La camara no soporta la resolucion solicitada.';
        }
      }
      setErrorMsg(message);
      setCameraState('error');
    }
  }, [stopCamera, handleRef]);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setCameraState('idle');
      setErrorMsg('');
      return;
    }

    const timer = setTimeout(() => startCamera(), 150);

    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, [open, startCamera, stopCamera]);

  return (
    <Modal open={open} onClose={onClose} title="Busqueda por QR / Referencia">
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 0 }}>
        Escanea el QR con la camara o introduce la referencia manualmente:
      </p>

      {/* Zona de camara */}
      <div style={{
        position: 'relative', marginBottom: '1rem', borderRadius: 8, overflow: 'hidden',
        background: '#000', minHeight: 220,
      }}>
        <video
          ref={videoRef}
          style={{
            width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block',
          }}
          playsInline
          muted
        />

        {/* Overlay de guia de escaneo */}
        {cameraState === 'active' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{
              width: 180, height: 180, border: '3px solid rgba(255,255,255,0.7)', borderRadius: 12,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)',
            }}>
              <div style={{
                position: 'absolute', top: -1, left: 20, right: 20, height: 3,
                background: 'var(--accent)', borderRadius: 2, animation: 'qr-scan-line 2s ease-in-out infinite',
              }} />
            </div>
          </div>
        )}

        {/* Estado: cargando */}
        {cameraState === 'loading' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8, color: '#fff', fontSize: 13,
          }}>
            <div style={{
              width: 28, height: 28, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite',
            }} />
            Abriendo camara...
          </div>
        )}

        {/* Estado: error */}
        {cameraState === 'error' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20, textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, opacity: 0.6 }}>&#128247;</div>
            <p style={{ color: '#fff', fontSize: 13, margin: 0, lineHeight: 1.4 }}>{errorMsg}</p>
            <button
              style={{ ...btnStyle('primary'), fontSize: 12, padding: '6px 16px' }}
              onClick={startCamera}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Estado: inactivo (sin camara) */}
        {cameraState === 'idle' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.5)', fontSize: 13,
          }}>
            Preparando camara...
          </div>
        )}
      </div>

      {/* Entrada manual */}
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
          50% { transform: translateY(174px); opacity: 0.6; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Modal>
  );
}
