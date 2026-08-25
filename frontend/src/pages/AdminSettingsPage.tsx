import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { btnStyle, colors } from '../styles/theme';
import * as settingsApi from '../api/settings';
import type { EmailOrdersMode } from '../api/settings';

const MODE_LABELS: Record<EmailOrdersMode, string> = {
  all: 'Todos los pedidos',
  urgent_only: 'Solo pedidos urgentes',
  none: 'Ninguno (desactivar emails de pedidos)',
};

export function AdminSettingsPage() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings', 'notifications'],
    queryFn: () => settingsApi.getNotificationSettings(),
    enabled: isAdmin,
  });

  const [form, setForm] = useState<Partial<settingsApi.NotificationSettings>>({});

  const updateMutation = useMutation({
    mutationFn: (data: Partial<settingsApi.NotificationSettings>) =>
      settingsApi.updateNotificationSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'notifications'] });
      showToast('Ajustes guardados', 'success');
      setForm({});
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  if (!isAdmin) {
    return (
      <div style={{ padding: '2rem', color: colors.textMuted, textAlign: 'center' }}>
        No tienes permisos para ver esta página.
      </div>
    );
  }

  const current = { ...settings, ...form } as settingsApi.NotificationSettings;

  function toggle<K extends keyof settingsApi.NotificationSettings>(key: K, value: settingsApi.NotificationSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function save() {
    updateMutation.mutate(form);
  }

  const changed = Object.keys(form).length > 0;

  return (
    <div style={{ padding: '1.5rem', color: colors.text }}>
      <h2 style={{ margin: '0 0 1.5rem', fontSize: 22 }}>Ajustes de administrador</h2>

      {isLoading && <div style={{ color: colors.textMuted, marginBottom: '1rem' }}>Cargando ajustes...</div>}

      {settings && (
        <div style={{ background: colors.bgCard, borderRadius: 12, border: `1px solid ${colors.border}`, padding: '1.5rem', maxWidth: 720 }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: 18 }}>Notificaciones por correo</h3>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ color: colors.textMuted, fontSize: 12, display: 'block', marginBottom: 6 }}>
              Email de notificaciones de pedidos y registros
            </label>
            <input
              type="email"
              value={current.notifyEmail}
              onChange={(e) => toggle('notifyEmail', e.target.value)}
              style={{
                width: '100%', maxWidth: 360, padding: '8px 12px', borderRadius: 6,
                background: 'var(--bg-input-dark)', color: colors.text, border: `1px solid ${colors.border}`, boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ color: colors.textMuted, fontSize: 12, display: 'block', marginBottom: 6 }}>
              Enviar emails de pedidos
            </label>
            <select
              value={current.emailOrdersMode}
              onChange={(e) => toggle('emailOrdersMode', e.target.value as EmailOrdersMode)}
              style={{
                padding: '8px 12px', borderRadius: 6, background: 'var(--bg-input-dark)',
                color: colors.text, border: `1px solid ${colors.border}`,
              }}
            >
              <option value="all">{MODE_LABELS.all}</option>
              <option value="urgent_only">{MODE_LABELS.urgent_only}</option>
              <option value="none">{MODE_LABELS.none}</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
            <input
              id="notifyAdminOnRegister"
              type="checkbox"
              checked={current.notifyAdminOnRegister}
              onChange={(e) => toggle('notifyAdminOnRegister', e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--accent)' }}
            />
            <label htmlFor="notifyAdminOnRegister" style={{ fontSize: 14, cursor: 'pointer' }}>
              Notificar al administrador cuando se registra un nuevo usuario
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
            <input
              id="mailEnabled"
              type="checkbox"
              checked={current.mailEnabled}
              onChange={(e) => toggle('mailEnabled', e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--accent)' }}
            />
            <label htmlFor="mailEnabled" style={{ fontSize: 14, cursor: 'pointer' }}>
              Envío de correos activado
            </label>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={save}
              disabled={updateMutation.isPending || !changed}
              style={btnStyle('primary')}
            >
              {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {changed && (
              <button
                type="button"
                onClick={() => setForm({})}
                disabled={updateMutation.isPending}
                style={btnStyle('ghost')}
              >
                Descartar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
