import { useState, useEffect, useRef } from 'react';
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
      const product = await recambiosApi.getRecambioByRef(trimmed);
      onFound(product);
      onClose();
      setManualRef('');
    } catch {
      showToast(`Referencia no encontrada: ${trimmed}`);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Búsqueda por QR / Referencia">
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 0 }}>
        Escanea el QR con la cámara o introduce la referencia manualmente:
      </p>

      <div style={{ marginBottom: '1rem', borderRadius: 8, overflow: 'hidden', background: '#000', minHeight: 200 }}>
        <video ref={videoRef} style={{ width: '100%', maxHeight: 240, display: scanning ? 'block' : 'none' }} />
        {!scanning && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
            Cámara no disponible — usa la entrada manual
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
          Referencia CMH o Cliente
        </label>
        <input
          value={manualRef}
          onChange={(e) => setManualRef(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRef(manualRef)}
          placeholder="CMH00001 o CLI-000001"
          style={{
            width: '100%', padding: '9px 12px', background: 'var(--bg-input)',
            border: '1px solid var(--border-input)', borderRadius: 8, color: 'var(--text)', fontSize: 14,
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
