import { apiFetch } from './client';

export type EmailOrdersMode = 'all' | 'urgent_only' | 'none';

export interface NotificationSettings {
  mailEnabled: boolean;
  notifyEmail: string;
  notifyAdminOnRegister: boolean;
  emailOrdersMode: EmailOrdersMode;
}

export function getNotificationSettings() {
  return apiFetch<NotificationSettings>('/api/settings/notifications');
}

export function updateNotificationSettings(settings: Partial<NotificationSettings>) {
  return apiFetch<NotificationSettings>('/api/settings/notifications', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}
