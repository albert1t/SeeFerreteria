import nodemailer from 'nodemailer';
import { z } from 'zod';
import { env } from '../config/env.js';
import * as settingsService from './settingsService.js';
import { shouldNotifyOrderEvent } from '../types/index.js';
const emailSchema = z.string().email();
function smtpConfigured() {
    return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}
function createTransporter() {
    if (!smtpConfigured()) {
        return null;
    }
    return nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: env.NODE_ENV === 'production',
        },
    });
}
const transporter = createTransporter();
export function esEmailValido(value) {
    return emailSchema.safeParse(value).success;
}
// Cuentas Microsoft: el username ya es el email real, se usa tal cual. Cuentas de
// contraseña: usan el correo de notificación que el propio usuario configuró en
// "Mis avisos" (null si no lo ha configurado o no es válido).
export function resolveNotificationEmail(username, notificationEmail) {
    if (esEmailValido(username))
        return username;
    return notificationEmail && esEmailValido(notificationEmail) ? notificationEmail : null;
}
export async function getMailConfigStatus() {
    const settings = await settingsService.getNotificationSettings().catch(() => null);
    return {
        enabled: settings?.mailEnabled ?? env.MAIL_ENABLED,
        configured: smtpConfigured(),
        host: env.SMTP_HOST ?? null,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        user: env.SMTP_USER ?? null,
        from: env.MAIL_FROM,
        replyTo: env.MAIL_REPLY_TO,
        notifyTo: settings?.notifyEmail ?? env.NOTIFY_EMAIL,
        notifyAdminOnRegister: settings?.notifyAdminOnRegister ?? env.NOTIFY_ADMIN_ON_REGISTER,
        orderNotificationMatrix: settings?.orderNotificationMatrix ?? null,
    };
}
async function enviarCorreo({ to, subject, html, }) {
    const settings = await settingsService.getNotificationSettings().catch(() => null);
    if (settings && !settings.mailEnabled) {
        console.error('[mail] Envío deshabilitado por mailEnabled=false');
        return;
    }
    if (!smtpConfigured() || !transporter) {
        console.error('[mail] SMTP no configurado. Correo no enviado:', subject, '->', to);
        return;
    }
    try {
        await transporter.sendMail({
            from: env.MAIL_FROM,
            replyTo: env.MAIL_REPLY_TO,
            to,
            subject,
            html,
        });
        console.error('[mail] Enviado:', subject, '->', to);
    }
    catch (err) {
        console.error('[mail] Error enviando correo:', err);
    }
}
export async function enviarCorreoDePrueba(to) {
    const status = await getMailConfigStatus();
    if (!status.enabled) {
        throw new Error('MAIL_ENABLED=false');
    }
    if (!status.configured || !transporter) {
        throw new Error(`SMTP no configurado. Host=${status.host}, User=${status.user}`);
    }
    const html = envolverHtml('Correo de prueba - SeeFerreteria', `
      <p>Este es un correo de prueba.</p>
      <p>Configuración detectada:</p>
      <ul>
        <li>Host SMTP: ${status.host}</li>
        <li>Puerto: ${status.port}</li>
        <li>Usuario: ${status.user}</li>
        <li>From: ${status.from}</li>
        <li>Reply-To: ${status.replyTo}</li>
      </ul>
    `);
    const info = await transporter.sendMail({
        from: env.MAIL_FROM,
        replyTo: env.MAIL_REPLY_TO,
        to,
        subject: 'Correo de prueba - SeeFerreteria',
        html,
    });
    console.error('[mail] Correo de prueba enviado:', info.messageId, '->', to);
    return {
        messageId: info.messageId,
        accepted: info.accepted.map((a) => (typeof a === 'string' ? a : a.address)),
    };
}
function datosPedido(order) {
    const unidadesPorPaquete = parseUnidadesPorPaquete(order.productPackaging);
    const totalUnidades = order.quantity * unidadesPorPaquete;
    return `
    <li><strong>Referencia:</strong> ${order.productRef ?? 'N/A'}</li>
    <li><strong>Producto:</strong> ${order.productName ?? 'N/A'}</li>
    <li><strong>Unidades por paquete:</strong> ${unidadesPorPaquete}${order.productPackaging ? ` (${order.productPackaging})` : ''}</li>
    <li><strong>Número de paquetes:</strong> ${order.quantity}</li>
    <li><strong>Total de unidades:</strong> ${totalUnidades}</li>
    <li><strong>Tipo:</strong> ${order.type}</li>
    <li><strong>Plazo deseado:</strong> ${order.desiredDeadline ?? 'No indicado'}</li>
    <li><strong>Observaciones:</strong> ${order.notes ?? 'Ninguna'}</li>
    <li><strong>Solicitante:</strong> ${order.requesterName ?? 'N/A'}</li>
    <li><strong>Fecha:</strong> ${formatDateTime(order.requestedAt)}</li>
  `;
}
function parseUnidadesPorPaquete(packaging) {
    const match = packaging?.match(/(\d+(?:[.,]\d+)?)/);
    const value = match ? Number(match[1].replace(',', '.')) : 1;
    return Number.isFinite(value) && value > 0 ? value : 1;
}
function formatDateTime(value) {
    return new Intl.DateTimeFormat('es-ES', {
        timeZone: 'Europe/Madrid',
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(value));
}
function asuntoPedido(order) {
    const fecha = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid' }).format(new Date(order.requestedAt));
    return `${order.type} - ${fecha}`;
}
function prefijoUrgente(order) {
    return order.priority ? 'URGENTE! ' : '';
}
function envolverHtml(titulo, contenido) {
    return `
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>${titulo}</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #1e3a8a; margin-top: 0;">${titulo}</h2>
      ${contenido}
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #64748b;">
        Este mensaje se ha generado automáticamente desde SeeFerreteria.<br />
        Para responder, escribe a <a href="mailto:${env.MAIL_REPLY_TO}">${env.MAIL_REPLY_TO}</a>.
      </p>
    </div>
  </body>
</html>
  `.trim();
}
// Notificación a la empresa (notifyEmail global); se llama tanto al crear un pedido como
// al avanzar de estado, y cada uno se filtra por su propia casilla en orderNotificationMatrix.
export async function notificarEventoPedido(order, event) {
    const settings = await settingsService.getNotificationSettings().catch(() => null);
    if (!settings || !settings.mailEnabled)
        return;
    if (!shouldNotifyOrderEvent(settings.orderNotificationMatrix, order.type, event))
        return;
    const esCreacion = event === 'created';
    const subject = esCreacion
        ? `${prefijoUrgente(order)}Nuevo pedido #${order.id} - ${asuntoPedido(order)}`
        : `${prefijoUrgente(order)}Pedido #${order.id} - ${event} - ${asuntoPedido(order)}`;
    const html = envolverHtml(esCreacion ? `Nuevo pedido #${order.id}` : `Pedido #${order.id} ha pasado a: ${event}`, `
      <p>${esCreacion ? 'Se ha creado un nuevo pedido en SeeFerreteria.' : `El pedido #${order.id} ha cambiado de estado.`}</p>
      <ul>
        ${datosPedido(order)}
      </ul>
    `);
    await enviarCorreo({ to: settings.notifyEmail, subject, html });
}
export async function enviarAcuseSolicitante(order, emailSolicitante) {
    const subject = `${prefijoUrgente(order)}Confirmación de tu pedido #${order.id} - ${asuntoPedido(order)}`;
    const html = envolverHtml(`Hemos recibido tu pedido #${order.id}`, `
      <p>Hola,</p>
      <p>Hemos registrado tu pedido correctamente. Estos son los detalles:</p>
      <ul>
        ${datosPedido(order)}
      </ul>
      <p>Te informaremos por correo cuando el pedido avance de estado.</p>
    `);
    await enviarCorreo({ to: emailSolicitante, subject, html });
}
export async function enviarSeguimientoEstado(order, emailSolicitante, newStatus) {
    const subject = `${prefijoUrgente(order)}Actualización de tu pedido #${order.id} - ${newStatus} - ${asuntoPedido(order)}`;
    const html = envolverHtml(`Tu pedido #${order.id} ha pasado a: ${newStatus}`, `
      <p>Hola,</p>
      <p>Tu pedido ha cambiado de estado.</p>
      <ul>
        <li><strong>Estado actual:</strong> ${newStatus}</li>
        ${datosPedido(order)}
      </ul>
      <p>Si tienes alguna duda, contacta con el departamento comercial.</p>
    `);
    await enviarCorreo({ to: emailSolicitante, subject, html });
}
export async function enviarActualizacionPedido(order, emailSolicitante) {
    const subject = `${prefijoUrgente(order)}Pedido #${order.id} actualizado - ${asuntoPedido(order)}`;
    const html = envolverHtml(`Tu pedido #${order.id} ha sido actualizado`, `
      <p>Se han actualizado los datos de tu pedido. Este es el desglose actual:</p>
      <ul>${datosPedido(order)}</ul>
    `);
    await enviarCorreo({ to: emailSolicitante, subject, html });
}
export async function notificarNuevoRegistro(user) {
    const settings = await settingsService.getNotificationSettings().catch(() => null);
    if (!settings || !settings.mailEnabled || !settings.notifyAdminOnRegister) {
        return;
    }
    const subject = `Nuevo usuario registrado - ${user.username}`;
    const html = envolverHtml('Nuevo registro de usuario en SeeFerreteria', `
      <p>Se ha registrado un nuevo usuario.</p>
      <ul>
        <li><strong>Usuario:</strong> ${user.username}</li>
        <li><strong>Nombre:</strong> ${user.name}</li>
        <li><strong>Rol:</strong> ${user.role}</li>
        <li><strong>ID:</strong> ${user.id}</li>
      </ul>
      <p>Recuerda revisar y activar la cuenta si es necesario.</p>
    `);
    await enviarCorreo({ to: settings.notifyEmail, subject, html });
}
