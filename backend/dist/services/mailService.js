import nodemailer from 'nodemailer';
import { z } from 'zod';
import { env } from '../config/env.js';
import * as settingsService from './settingsService.js';
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
export async function getMailConfigStatus() {
    const settings = await settingsService.getNotificationSettings().catch(() => ({
        mailEnabled: env.MAIL_ENABLED,
        notifyEmail: env.NOTIFY_EMAIL,
        notifyAdminOnRegister: env.NOTIFY_ADMIN_ON_REGISTER,
        emailOrdersMode: env.EMAIL_ORDERS_MODE,
    }));
    return {
        enabled: settings.mailEnabled,
        configured: smtpConfigured(),
        host: env.SMTP_HOST ?? null,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        user: env.SMTP_USER ?? null,
        from: env.MAIL_FROM,
        replyTo: env.MAIL_REPLY_TO,
        notifyTo: settings.notifyEmail,
        notifyAdminOnRegister: settings.notifyAdminOnRegister,
        emailOrdersMode: settings.emailOrdersMode,
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
        <li>Modo pedidos: ${status.emailOrdersMode}</li>
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
    return `
    <li><strong>Referencia:</strong> ${order.productRef ?? 'N/A'}</li>
    <li><strong>Producto:</strong> ${order.productName ?? 'N/A'}</li>
    <li><strong>Cantidad:</strong> ${order.quantity} paquete(s)</li>
    <li><strong>Tipo:</strong> ${order.type}</li>
    <li><strong>Plazo deseado:</strong> ${order.desiredDeadline ?? 'No indicado'}</li>
    <li><strong>Observaciones:</strong> ${order.notes ?? 'Ninguna'}</li>
    <li><strong>Solicitante:</strong> ${order.requesterName ?? 'N/A'}</li>
    <li><strong>Fecha:</strong> ${new Date(order.requestedAt).toLocaleString('es-ES')}</li>
  `;
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
export async function notificarNuevoPedido(order) {
    const settings = await settingsService.getNotificationSettings().catch(() => null);
    if (!settings || !settings.mailEnabled)
        return;
    if (!settingsService.shouldSendOrderEmail(order, settings.emailOrdersMode))
        return;
    const subject = `Nuevo pedido #${order.id} - ${order.productName ?? order.productRef ?? 'producto'}`;
    const html = envolverHtml(`Nuevo pedido #${order.id}`, `
      <p>Se ha creado un nuevo pedido en SeeFerreteria.</p>
      <ul>
        ${datosPedido(order)}
      </ul>
    `);
    await enviarCorreo({ to: settings.notifyEmail, subject, html });
}
export async function enviarAcuseSolicitante(order, emailSolicitante) {
    const settings = await settingsService.getNotificationSettings().catch(() => null);
    if (!settings || !settings.mailEnabled)
        return;
    if (!settingsService.shouldSendOrderEmail(order, settings.emailOrdersMode))
        return;
    const subject = `Confirmación de tu pedido #${order.id}`;
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
    const settings = await settingsService.getNotificationSettings().catch(() => null);
    if (!settings || !settings.mailEnabled)
        return;
    if (!settingsService.shouldSendOrderEmail(order, settings.emailOrdersMode))
        return;
    const subject = `Actualización de tu pedido #${order.id} - ${newStatus}`;
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
