import { apiFetch } from './client';
import type { OrderNotificationMatrix } from '../types';

export interface NotificationSettings {
  mailEnabled: boolean;
  notifyEmail: string;
  notifyAdminOnRegister: boolean;
  orderNotificationMatrix: OrderNotificationMatrix;
}

export interface UserNotificationSettings {
  orderNotificationMatrix: OrderNotificationMatrix;
  notificationEmail: string | null;
  isEmailEditable: boolean;
}

export function getMyNotificationSettings() {
  return apiFetch<UserNotificationSettings>('/api/settings/my-notifications');
}

export function updateMyNotificationSettings(settings: { orderNotificationMatrix: OrderNotificationMatrix; notificationEmail?: string | null }) {
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
