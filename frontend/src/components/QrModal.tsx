import { useState, useEffect, useRef } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { Modal } from './Modal';
import { btnStyle } from '../styles/theme';
import * as recambiosApi from '../api/recambios';
import { useToast } from './Toast';
import type { Recambio } from '../types';

interface QrModalProps {
  open: boolean;
  onClose: () => void;
  onFound: (recambio: Recambio) => void;
}

export function QrModal({ open, onClose, onFound }: QrModalProps) {
  const [manualRef, setManualRef] = useState('');
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { showToast } = useToast();

  function stopCamera() {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  useEffect(() => {
    if (!open) {
      stopCamera();
      setScanning(false);
      return;
    }

    let cancelled = false;

    async function startScan() {
      try {
        const reader = new BrowserQRCodeReader();
        setScanning(true);
        const result = await reader.decodeOnceFromVideoDevice(undefined, videoRef.current!);
        if (cancelled) return;
        stopCamera();
        await handleRef(result.getText());
      } catch {
        if (!cancelled) {
          stopCamera();
          setScanning(false);
        }
      }
    }

    const timer = setTimeout(() => {
      if (videoRef.current) startScan();
    }, 100);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      stopCamera();
    };
  }, [open]);

  async function handleRef(ref: string) {
    const trimmed = ref.trim();
    if (!trimmed) return;
    try {
      const recambio = await recambiosApi.getRecambioByRef(trimmed);
      onFound(recambio);
      onClose();
      setManualRef('');
    } catch {
      showToast(`Referencia no encontrada: ${trimmed}`);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Búsqueda por QR / Referencia">
      <p style={{ color: '#7aade0', fontSize: 13, marginTop: 0 }}>
        Escanea el QR con la cámara o introduce la referencia manualmente:
      </p>

      <div style={{ marginBottom: '1rem', borderRadius: 8, overflow: 'hidden', background: '#000', minHeight: 200 }}>
        <video ref={videoRef} style={{ width: '100%', maxHeight: 240, display: scanning ? 'block' : 'none' }} />
        {!scanning && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#4a7aaa', fontSize: 13 }}>
            Cámara no disponible — usa la entrada manual
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: 12, color: '#7aade0', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
          Referencia CMH o Cliente
        </label>
        <input
          value={manualRef}
          onChange={(e) => setManualRef(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRef(manualRef)}
          placeholder="CMH00001 o CLI-000001"
          style={{
            width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(77,184,255,0.25)', borderRadius: 8, color: '#e8eef6', fontSize: 14,
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btnStyle('primary')} onClick={() => handleRef(manualRef)}>🔍 Buscar</button>
        <button style={btnStyle('ghost')} onClick={onClose}>Cancelar</button>
      </div>
    </Modal>
  );
}
