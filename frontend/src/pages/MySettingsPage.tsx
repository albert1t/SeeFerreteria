import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { btnStyle } from '../styles/theme';
import { useToast } from '../components/Toast';
import * as settingsApi from '../api/settings';

const LABELS: Record<settingsApi.EmailOrdersMode, string> = {
  all: 'Todos mis pedidos',
  urgent_only: 'Solo pedidos urgentes',
  none: 'No recibir correos de pedidos',
};

export function MySettingsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings', 'my-notifications'],
    queryFn: settingsApi.getMyNotificationSettings,
  });
  const [mode, setMode] = useState<settingsApi.EmailOrdersMode | null>(null);
  const updateMutation = useMutation({
    mutationFn: settingsApi.updateMyNotificationSettings,
    onSuccess: (saved) => {
      queryClient.setQueryData(['settings', 'my-notifications'], saved);
      setMode(null);
      showToast('Preferencias guardadas', 'success');
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const current = mode ?? settings?.emailOrdersMode ?? 'all';

  return (
    <div style={{ padding: '1.5rem', color: 'var(--text)' }}>
      <h2 style={{ margin: '0 0 1.5rem', fontSize: 22 }}>Mis avisos por correo</h2>
      <section style={{ maxWidth: 640, padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
        <p style={{ marginTop: 0, color: 'var(--text-muted)', fontSize: 14 }}>
          Esta preferencia solo afecta a los correos que recibes tú. Los avisos generales de la empresa se configuran aparte.
        </p>
        {isLoading ? <p>Cargando preferencias...</p> : (
          <>
            <label htmlFor="myEmailOrdersMode" style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
              Avisos de mis pedidos
            </label>
            <select
              id="myEmailOrdersMode"
              value={current}
              onChange={(event) => setMode(event.target.value as settingsApi.EmailOrdersMode)}
              style={{ width: '100%', maxWidth: 360, padding: '9px 12px', borderRadius: 8, color: 'var(--text)', background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}
            >
              {Object.entries(LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              Los correos personales se envían a la dirección asociada a tu usuario, si es una dirección válida.
            </p>
            <button
              type="button"
              disabled={mode === null || updateMutation.isPending}
              onClick={() => updateMutation.mutate({ emailOrdersMode: current })}
              style={btnStyle('primary')}
            >
              {updateMutation.isPending ? 'Guardando...' : 'Guardar preferencias'}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
