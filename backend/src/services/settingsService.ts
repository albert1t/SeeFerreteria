import { env } from '../config/env.js';
import * as settingsRepo from '../repositories/settings.js';

export type EmailOrdersMode = 'all' | 'urgent_only' | 'none';

export interface NotificationSettings {
  mailEnabled: boolean;
  notifyEmail: string;
  notifyAdminOnRegister: boolean;
  emailOrdersMode: EmailOrdersMode;
}

const KEYS = {
  mailEnabled: 'mailEnabled',
  notifyEmail: 'notifyEmail',
  notifyAdminOnRegister: 'notifyAdminOnRegister',
  emailOrdersMode: 'emailOrdersMode',
} as const;

function parseBool(value: string | null, fallback: boolean): boolean {
  if (value === null || value === undefined) return fallback;
  return value === 'true' || value === '1';
}

function parseEmailOrdersMode(value: string | null): EmailOrdersMode {
  if (value === 'urgent_only' || value === 'none') return value;
  return 'all';
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const all = await settingsRepo.getAll();
  return {
    mailEnabled: parseBool(all[KEYS.mailEnabled], env.MAIL_ENABLED),
    notifyEmail: all[KEYS.notifyEmail] || env.NOTIFY_EMAIL,
    notifyAdminOnRegister: parseBool(all[KEYS.notifyAdminOnRegister], env.NOTIFY_ADMIN_ON_REGISTER),
    emailOrdersMode: parseEmailOrdersMode(all[KEYS.emailOrdersMode] || env.EMAIL_ORDERS_MODE),
  };
}

export async function updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
  if (settings.mailEnabled !== undefined) {
    await settingsRepo.setValue(KEYS.mailEnabled, String(settings.mailEnabled));
  }
  if (settings.notifyEmail !== undefined) {
    await settingsRepo.setValue(KEYS.notifyEmail, settings.notifyEmail);
  }
  if (settings.notifyAdminOnRegister !== undefined) {
    await settingsRepo.setValue(KEYS.notifyAdminOnRegister, String(settings.notifyAdminOnRegister));
  }
  if (settings.emailOrdersMode !== undefined) {
    await settingsRepo.setValue(KEYS.emailOrdersMode, settings.emailOrdersMode);
  }
  return getNotificationSettings();
}

export function shouldSendOrderEmail(order: { priority: boolean }, mode: EmailOrdersMode): boolean {
  if (mode === 'none') return false;
  if (mode === 'urgent_only') return order.priority;
  return true;
}
