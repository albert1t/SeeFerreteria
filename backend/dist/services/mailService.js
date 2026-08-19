import nodemailer from 'nodemailer';
import { z } from 'zod';
import { env } from '../config/env.js';
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
async function enviarCorreo({ to, subject, html, }) {
    if (!env.MAIL_ENABLED) {
        console.log('[mail] Envío deshabilitado por MAIL_ENABLED=false');
        return;
    }
    if (!smtpConfigured() || !transporter) {
        console.warn('[mail] SMTP no configurado. Correo no enviado:', subject, '->', to);
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
        console.log('[mail] Enviado:', subject, '->', to);
    }
    catch (err) {
        console.error('[mail] Error enviando correo:', err);
    }
}
function datosPedido(pedido) {
    return `
    <li><strong>Referencia:</strong> ${pedido.recambioRef ?? 'N/A'}</li>
    <li><strong>Recambio:</strong> ${pedido.recambioNombre ?? 'N/A'}</li>
    <li><strong>Cantidad:</strong> ${pedido.cantidad} paquete(s)</li>
    <li><strong>Tipo:</strong> ${pedido.tipo}</li>
    <li><strong>Plazo deseado:</strong> ${pedido.plazoDeseado ?? 'No indicado'}</li>
    <li><strong>Observaciones:</strong> ${pedido.observaciones ?? 'Ninguna'}</li>
    <li><strong>Solicitante:</strong> ${pedido.solicitanteNombre ?? 'N/A'}</li>
    <li><strong>Fecha:</strong> ${new Date(pedido.fechaSolicitud).toLocaleString('es-ES')}</li>
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
export async function notificarNuevoPedido(pedido) {
    const subject = `Nuevo pedido #${pedido.id} - ${pedido.recambioNombre ?? pedido.recambioRef ?? 'recambio'}`;
    const html = envolverHtml(`Nuevo pedido #${pedido.id}`, `
      <p>Se ha creado un nuevo pedido en SeeFerreteria.</p>
      <ul>
        ${datosPedido(pedido)}
      </ul>
    `);
    await enviarCorreo({ to: env.NOTIFY_EMAIL, subject, html });
}
export async function enviarAcuseSolicitante(pedido, emailSolicitante) {
    const subject = `Confirmación de tu pedido #${pedido.id}`;
    const html = envolverHtml(`Hemos recibido tu pedido #${pedido.id}`, `
      <p>Hola,</p>
      <p>Hemos registrado tu pedido correctamente. Estos son los detalles:</p>
      <ul>
        ${datosPedido(pedido)}
      </ul>
      <p>Te informaremos por correo cuando el pedido avance de estado.</p>
    `);
    await enviarCorreo({ to: emailSolicitante, subject, html });
}
export async function enviarSeguimientoEstado(pedido, emailSolicitante, nuevoEstado) {
    const subject = `Actualización de tu pedido #${pedido.id} - ${nuevoEstado}`;
    const html = envolverHtml(`Tu pedido #${pedido.id} ha pasado a: ${nuevoEstado}`, `
      <p>Hola,</p>
      <p>Tu pedido ha cambiado de estado.</p>
      <ul>
        <li><strong>Estado actual:</strong> ${nuevoEstado}</li>
        ${datosPedido(pedido)}
      </ul>
      <p>Si tienes alguna duda, contacta con el departamento comercial.</p>
    `);
    await enviarCorreo({ to: emailSolicitante, subject, html });
}
