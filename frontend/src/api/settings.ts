import { apiFetch } from './client';

export type EmailOrdersMode = 'all' | 'urgent_only' | 'none';

export interface NotificationSettings {
  mailEnabled: boolean;
  notifyEmail: string;
  notifyAdminOnRegister: boolean;
  emailOrdersMode: EmailOrdersMode;
}

export interface UserNotificationSettings {
  emailOrdersMode: EmailOrdersMode;
}

export function getMyNotificationSettings() {
  return apiFetch<UserNotificationSettings>('/api/settings/my-notifications');
}

export function updateMyNotificationSettings(settings: UserNotificationSettings) {
  return apiFetch<UserNotificationSettings>('/api/settings/my-notifications', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
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
