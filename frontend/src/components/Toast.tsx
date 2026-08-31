import { createContext, useContext, useState, useCallback, useRef, type ReactNode, type TouchEvent } from 'react';

type ToastType = 'error' | 'success' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const MAX_TOASTS = 3;
const TOAST_DURATION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const touchStartRef = useRef<Map<number, number>>(new Map());

  const removeToast = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer) clearTimeout(timer);
    timersRef.current.delete(id);
    touchStartRef.current.delete(id);
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'error') => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type };
    setToasts((t) => {
      const next = [...t.slice(-(MAX_TOASTS - 1)), newToast];
      return next;
    });
    const timer = setTimeout(() => removeToast(id), TOAST_DURATION_MS);
    timersRef.current.set(id, timer);
  }, [removeToast]);

  const handleTouchStart = useCallback((id: number, e: TouchEvent<HTMLDivElement>) => {
    touchStartRef.current.set(id, e.changedTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback((id: number, e: TouchEvent<HTMLDivElement>) => {
    const startX = touchStartRef.current.get(id);
    if (startX == null) return;
    const endX = e.changedTouches[0].clientX;
    if (Math.abs(endX - startX) > 50) {
      removeToast(id);
    }
  }, [removeToast]);

  const colors: Record<ToastType, string> = {
    error: 'var(--danger)',
    success: 'var(--success)',
    info: 'var(--accent-dark)',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 2000,
          display: 'flex', flexDirection: 'column', gap: 8,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            onTouchStart={(e) => handleTouchStart(t.id, e)}
            onTouchEnd={(e) => handleTouchEnd(t.id, e)}
            style={{
              background: colors[t.type], color: '#fff', padding: '12px 18px',
              borderRadius: 8, fontSize: 13, fontWeight: 600,
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              maxWidth: 360, cursor: 'pointer', userSelect: 'none',
              pointerEvents: 'auto', touchAction: 'pan-y',
              transition: 'transform 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ flex: 1 }}>{t.message}</span>
              <span style={{ fontSize: 16, opacity: 0.8, lineHeight: 1 }}>×</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
