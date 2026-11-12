import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { btnStyle } from '../styles/theme';
import { useToast } from '../components/Toast';
import { OrderNotificationMatrixEditor } from '../components/OrderNotificationMatrixEditor';
import * as settingsApi from '../api/settings';
import type { OrderNotificationMatrix } from '../types';

const inputStyle = {
  width: '100%', maxWidth: 360, padding: '9px 12px', borderRadius: 8,
  color: 'var(--text)', background: 'var(--bg-input)', border: '1px solid var(--border-input)',
} as const;

export function MySettingsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings', 'my-notifications'],
    queryFn: settingsApi.getMyNotificationSettings,
  });
  const [matrixDraft, setMatrixDraft] = useState<OrderNotificationMatrix | null>(null);
  const [emailDraft, setEmailDraft] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: settingsApi.updateMyNotificationSettings,
    onSuccess: (saved) => {
      queryClient.setQueryData(['settings', 'my-notifications'], saved);
      setMatrixDraft(null);
      setEmailDraft(null);
      showToast('Preferencias guardadas', 'success');
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const isEmailEditable = settings?.isEmailEditable ?? false;
  const emailValue = emailDraft ?? settings?.notificationEmail ?? '';
  const dirty = matrixDraft !== null || (isEmailEditable && emailDraft !== null && emailDraft !== (settings?.notificationEmail ?? ''));

  function handleSave() {
    if (!settings) return;
    updateMutation.mutate({
      orderNotificationMatrix: matrixDraft ?? settings.orderNotificationMatrix,
      ...(isEmailEditable ? { notificationEmail: emailValue.trim() || null } : {}),
    });
  }

  return (
    <div style={{ padding: '1.5rem', color: 'var(--text)' }}>
      <h2 style={{ margin: '0 0 1.5rem', fontSize: 22 }}>Mis avisos por correo</h2>
      <section style={{ maxWidth: 640, padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
        <p style={{ marginTop: 0, color: 'var(--text-muted)', fontSize: 14 }}>
          Esta preferencia solo afecta a los correos que recibes tú. Los avisos generales de la empresa se configuran aparte.
        </p>
        {isLoading || !settings ? <p>Cargando preferencias...</p> : (
          <>
            <label htmlFor="myNotificationEmail" style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
              Correo al que te llegan los avisos
            </label>
            {isEmailEditable ? (
              <input
                id="myNotificationEmail"
                type="email"
                placeholder="tucorreo@empresa.com"
                value={emailValue}
                onChange={(e) => setEmailDraft(e.target.value)}
                style={{ ...inputStyle, marginBottom: 4 }}
              />
            ) : (
              <div style={{ ...inputStyle, color: 'var(--text-muted)' }}>{settings.notificationEmail}</div>
            )}
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
              {isEmailEditable
                ? 'Si lo dejas vacío no recibirás ningún correo personal, aunque actives avisos abajo.'
                : 'Inicias sesión con Microsoft: los avisos llegan siempre a este correo, no se puede cambiar.'}
            </p>

            <label style={{ display: 'block', margin: '1.25rem 0 6px', fontSize: 13, fontWeight: 600 }}>
              Qué avisos quieres recibir, por tipo de pedido
            </label>
            <OrderNotificationMatrixEditor
              value={matrixDraft ?? settings.orderNotificationMatrix}
              onChange={setMatrixDraft}
            />

            <div style={{ marginTop: '1.25rem' }}>
              <button
                type="button"
                disabled={!dirty || updateMutation.isPending}
                onClick={handleSave}
                style={btnStyle('primary')}
              >
                {updateMutation.isPending ? 'Guardando...' : 'Guardar preferencias'}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
