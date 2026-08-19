import nodemailer from 'nodemailer';
import { z } from 'zod';
import { env } from '../config/env.js';
import type { Pedido, PedidoEstado } from '../types/index.js';

const emailSchema = z.string().email();

function smtpConfigured(): boolean {
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

export function esEmailValido(value: string): boolean {
  return emailSchema.safeParse(value).success;
}

export function getMailConfigStatus() {
  return {
    enabled: env.MAIL_ENABLED,
    configured: smtpConfigured(),
    host: env.SMTP_HOST ?? null,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    user: env.SMTP_USER ?? null,
    from: env.MAIL_FROM,
    replyTo: env.MAIL_REPLY_TO,
    notifyTo: env.NOTIFY_EMAIL,
  };
}

async function enviarCorreo({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!env.MAIL_ENABLED) {
    console.error('[mail] Envío deshabilitado por MAIL_ENABLED=false');
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
  } catch (err) {
    console.error('[mail] Error enviando correo:', err);
  }
}

export async function enviarCorreoDePrueba(to: string): Promise<{ messageId?: string; accepted: string[] }> {
  const status = getMailConfigStatus();
  if (!status.enabled) {
    throw new Error('MAIL_ENABLED=false');
  }
  if (!status.configured || !transporter) {
    throw new Error(`SMTP no configurado. Host=${status.host}, User=${status.user}`);
  }

  const html = envolverHtml(
    'Correo de prueba - SeeFerreteria',
    `
      <p>Este es un correo de prueba.</p>
      <p>Configuración detectada:</p>
      <ul>
        <li>Host SMTP: ${status.host}</li>
        <li>Puerto: ${status.port}</li>
        <li>Usuario: ${status.user}</li>
        <li>From: ${status.from}</li>
        <li>Reply-To: ${status.replyTo}</li>
      </ul>
    `
  );

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

function datosPedido(pedido: Pedido): string {
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

function envolverHtml(titulo: string, contenido: string): string {
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

export async function notificarNuevoPedido(pedido: Pedido): Promise<void> {
  const subject = `Nuevo pedido #${pedido.id} - ${pedido.recambioNombre ?? pedido.recambioRef ?? 'recambio'}`;
  const html = envolverHtml(
    `Nuevo pedido #${pedido.id}`,
    `
      <p>Se ha creado un nuevo pedido en SeeFerreteria.</p>
      <ul>
        ${datosPedido(pedido)}
      </ul>
    `
  );

  await enviarCorreo({ to: env.NOTIFY_EMAIL, subject, html });
}

export async function enviarAcuseSolicitante(pedido: Pedido, emailSolicitante: string): Promise<void> {
  const subject = `Confirmación de tu pedido #${pedido.id}`;
  const html = envolverHtml(
    `Hemos recibido tu pedido #${pedido.id}`,
    `
      <p>Hola,</p>
      <p>Hemos registrado tu pedido correctamente. Estos son los detalles:</p>
      <ul>
        ${datosPedido(pedido)}
      </ul>
      <p>Te informaremos por correo cuando el pedido avance de estado.</p>
    `
  );

  await enviarCorreo({ to: emailSolicitante, subject, html });
}

export async function enviarSeguimientoEstado(
  pedido: Pedido,
  emailSolicitante: string,
  nuevoEstado: PedidoEstado,
): Promise<void> {
  const subject = `Actualización de tu pedido #${pedido.id} - ${nuevoEstado}`;
  const html = envolverHtml(
    `Tu pedido #${pedido.id} ha pasado a: ${nuevoEstado}`,
    `
      <p>Hola,</p>
      <p>Tu pedido ha cambiado de estado.</p>
      <ul>
        <li><strong>Estado actual:</strong> ${nuevoEstado}</li>
        ${datosPedido(pedido)}
      </ul>
      <p>Si tienes alguna duda, contacta con el departamento comercial.</p>
    `
  );

  await enviarCorreo({ to: emailSolicitante, subject, html });
}
