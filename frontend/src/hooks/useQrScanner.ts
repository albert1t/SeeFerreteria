import { useCallback, useEffect, useRef, useState } from 'react';
import { DecodeHintType } from '@zxing/library';

const DEFAULT_COOLDOWN_MS = 2500;

interface ScannerControls {
  stop: () => void;
}

function isBackCamera(label: string): boolean {
  const lower = label.toLowerCase();
  return (
    /back|rear|environment|trasera/i.test(lower) &&
    !/front|selfie|user|facetime/i.test(lower)
  );
}

export interface UseQrScannerOptions {
  onScan: (text: string) => void | Promise<void>;
  cooldownMs?: number;
  autoStart?: boolean;
}

export function useQrScanner({ onScan, cooldownMs = DEFAULT_COOLDOWN_MS, autoStart = true }: UseQrScannerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<ScannerControls | null>(null);
  const scanCooldownRef = useRef<Map<string, number>>(new Map());
  const processingRef = useRef(false);
  const startRequestRef = useRef(0);

  const [cameraState, setCameraState] = useState<'idle' | 'loading' | 'active' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [backCameras, setBackCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(-1);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [zoomRange, setZoomRange] = useState<{ min: number; max: number; step: number } | null>(null);
  const [zoom, setZoom] = useState(1);

  const stopCamera = useCallback(() => {
    startRequestRef.current += 1;
    scanCooldownRef.current.clear();
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
    setZoomRange(null);
    setZoom(1);
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

  const startCamera = useCallback(
    async (deviceId?: string) => {
      if (!videoRef.current) return;
      stopCamera();
      const requestId = startRequestRef.current;
      setCameraState('loading');
      setErrorMsg('');

      try {
        const constraints: MediaStreamConstraints = deviceId
          ? {
              video: {
                deviceId: { exact: deviceId },
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                frameRate: { ideal: 30, max: 30 },
              },
            }
          : {
              video: {
                facingMode: { ideal: 'environment' },
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                frameRate: { ideal: 30, max: 30 },
              },
            };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (!videoRef.current || requestId !== startRequestRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        if (requestId !== startRequestRef.current) return;

        await applyTrackConstraints({ focusMode: 'continuous' } as MediaTrackConstraintSet);
        if (requestId !== startRequestRef.current) return;

        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities?.() as
          | (MediaTrackCapabilities & { torch?: boolean; zoom?: { min: number; max: number; step?: number } })
          | undefined;
        if (capabilities && 'torch' in capabilities) {
          setTorchSupported(true);
        }
        if (capabilities?.zoom) {
          const range = {
            min: capabilities.zoom.min,
            max: capabilities.zoom.max,
            step: capabilities.zoom.step || 0.1,
          };
          const initialZoom = Math.min(range.max, Math.max(range.min, 1));
          setZoomRange(range);
          const zoomApplied = await applyTrackConstraints({ zoom: initialZoom } as MediaTrackConstraintSet);
          if (zoomApplied) setZoom(initialZoom);
          if (requestId !== startRequestRef.current) return;
        }

        const { BrowserQRCodeReader } = await import('@zxing/browser');
        const hints = new Map([[DecodeHintType.TRY_HARDER, true]]);
        const reader = new BrowserQRCodeReader(hints, {
          delayBetweenScanAttempts: 200,
          delayBetweenScanSuccess: 500,
        });
        const controls = await reader.decodeFromVideoElement(videoRef.current, (result: { getText(): string } | null | undefined) => {
          if (requestId !== startRequestRef.current) return;
          if (!result) return;
          const text = result.getText();
          if (!text || processingRef.current) return;

          const now = Date.now();
          const lastScan = scanCooldownRef.current.get(text);
          if (lastScan && now - lastScan < cooldownMs) return;

          processingRef.current = true;
          scanCooldownRef.current.set(text, now);

          Promise.resolve(onScan(text))
            .catch(() => {
              // Errors are handled by the caller; avoid unhandled rejections.
            })
            .finally(() => {
              processingRef.current = false;
            });
        });
        if (requestId !== startRequestRef.current) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        setCameraState('active');

        const backs = await detectBackCameras();
        if (requestId !== startRequestRef.current) return;
        if (backs.length > 1) {
          const activeDeviceId = track.getSettings().deviceId || deviceId;
          const idx = backs.findIndex((c) => c.deviceId === activeDeviceId);
          setCurrentCameraIndex(idx >= 0 ? idx : 0);
        }
      } catch (err: unknown) {
        if (requestId !== startRequestRef.current) return;
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
    },
    [cooldownMs, onScan, stopCamera, applyTrackConstraints, detectBackCameras],
  );

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

  const changeZoom = useCallback(async (nextZoom: number) => {
    if (!zoomRange) return;
    const clamped = Math.min(zoomRange.max, Math.max(zoomRange.min, nextZoom));
    const ok = await applyTrackConstraints({ zoom: clamped } as MediaTrackConstraintSet);
    if (ok) setZoom(clamped);
  }, [zoomRange, applyTrackConstraints]);

  useEffect(() => {
    if (!autoStart) return;
    const timer = setTimeout(() => startCamera(), 300);
    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, [autoStart, startCamera, stopCamera]);

  return {
    videoRef,
    cameraState,
    errorMsg,
    startCamera,
    stopCamera,
    switchCamera,
    toggleTorch,
    torchSupported,
    torchOn,
    zoomRange,
    zoom,
    changeZoom,
    hasMultipleCameras,
  };
}
