import { env } from '../config/env.js';
import * as settingsRepo from '../repositories/settings.js';
import { defaultOrderNotificationMatrix, normalizeOrderNotificationMatrix } from '../types/index.js';
const KEYS = {
    mailEnabled: 'mailEnabled',
    notifyEmail: 'notifyEmail',
    notifyAdminOnRegister: 'notifyAdminOnRegister',
    orderNotificationMatrix: 'orderNotificationMatrix',
};
function parseBool(value, fallback) {
    if (value === null || value === undefined)
        return fallback;
    return value === 'true' || value === '1';
}
function parseMatrix(value) {
    if (!value)
        return defaultOrderNotificationMatrix(env.EMAIL_ORDERS_MODE !== 'none');
    try {
        return normalizeOrderNotificationMatrix(JSON.parse(value));
    }
    catch {
        return defaultOrderNotificationMatrix(true);
    }
}
export async function getNotificationSettings() {
    const all = await settingsRepo.getAll();
    return {
        mailEnabled: parseBool(all[KEYS.mailEnabled], env.MAIL_ENABLED),
        notifyEmail: all[KEYS.notifyEmail] || env.NOTIFY_EMAIL,
        notifyAdminOnRegister: parseBool(all[KEYS.notifyAdminOnRegister], env.NOTIFY_ADMIN_ON_REGISTER),
        orderNotificationMatrix: parseMatrix(all[KEYS.orderNotificationMatrix]),
    };
}
export async function updateNotificationSettings(settings) {
    if (settings.mailEnabled !== undefined) {
        await settingsRepo.setValue(KEYS.mailEnabled, String(settings.mailEnabled));
    }
    if (settings.notifyEmail !== undefined) {
        await settingsRepo.setValue(KEYS.notifyEmail, settings.notifyEmail);
    }
    if (settings.notifyAdminOnRegister !== undefined) {
        await settingsRepo.setValue(KEYS.notifyAdminOnRegister, String(settings.notifyAdminOnRegister));
    }
    if (settings.orderNotificationMatrix !== undefined) {
        await settingsRepo.setValue(KEYS.orderNotificationMatrix, JSON.stringify(settings.orderNotificationMatrix));
    }
    return getNotificationSettings();
}
