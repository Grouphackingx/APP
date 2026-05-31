import { baseLayout, ctaButton, formatDate, formatTime, iconCircle } from './base.layout';

interface EventCanceledProps {
  buyerName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventCity: string;
  orderId: string;
  siteUrl: string;
}

export function eventCanceledTemplate(p: EventCanceledProps): string {
  const content = `
  <!-- HERO -->
  <tr>
    <td bgcolor="#111318" style="background:linear-gradient(160deg,#1a0d0d 0%,#111318 100%);padding:48px 40px 36px;text-align:center;border-top:3px solid #ef4444;">
      ${iconCircle('⚠️', '#1a0d0d', 'rgba(239,68,68,0.5)')}
      <h1 class="hero-text" style="margin:0 0 12px;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">
        Evento cancelado
      </h1>
      <p style="margin:0;font-size:16px;color:#9ca3af;line-height:1.5;">
        Hola <strong style="color:#ffffff;">${p.buyerName}</strong>, te informamos sobre una actualización importante.
      </p>
    </td>
  </tr>

  <!-- BODY -->
  <tr>
    <td style="background-color:#111318;padding:36px 40px 28px;" class="pd-mobile">

      <!-- Event Info Box -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;">
        <tr>
          <td style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:20px 24px;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1px;color:#ef4444;text-transform:uppercase;">Evento cancelado</p>
            <p style="margin:0 0 12px;font-size:18px;font-weight:800;color:#ffffff;">${p.eventTitle}</p>
            <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">
              📅 &nbsp;${formatDate(p.eventDate)} · ${formatTime(p.eventDate)}
            </p>
            <p style="margin:0;font-size:13px;color:#9ca3af;">
              📍 &nbsp;${p.eventLocation}, ${p.eventCity}
            </p>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 20px;font-size:15px;color:#d1d5db;line-height:1.7;">
        Lamentamos informarte que este evento ha sido cancelado por el organizador. Sabemos que esto puede ser decepcionante y agradecemos tu comprensión.
      </p>

      <!-- Refund Info -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;">
        <tr>
          <td style="background:#0d1117;border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;padding:16px 20px;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#f59e0b;">💳 ¿Qué pasa con mi pago?</p>
            <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
              Si realizaste un pago, el reembolso será procesado de acuerdo a las políticas del organizador. Para consultas, contacta a nuestro equipo de soporte adjuntando tu número de orden.
            </p>
          </td>
        </tr>
      </table>

      <!-- Order reference -->
      <p style="margin:0 0 8px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Número de orden de referencia</p>
      <p style="margin:0 0 28px;font-size:15px;font-weight:700;color:#9ca3af;font-family:monospace;">#${p.orderId.substring(0, 8).toUpperCase()}</p>

      <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.6;">
        No necesitas hacer nada más. Tus entradas ya no son válidas. Si tienes preguntas, nuestro equipo de soporte está disponible para ayudarte.
      </p>

      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td align="center">
            ${ctaButton('Ir a mi perfil', `${p.siteUrl}/my-tickets`)}
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- SECURITY NOTICE -->
  <tr>
    <td bgcolor="#0d0f13" style="background-color:#0d0f13;padding:20px 40px;border-top:1px solid #1e2229;">
      <p style="margin:0;font-size:12px;color:#374151;text-align:center;line-height:1.6;font-family:Arial,sans-serif;">
        Recibiste este correo porque tienes una compra asociada a este evento.<br/>
        ¿Preguntas? <a href="mailto:soporte@afroeventos.com" style="color:#6AC44D;text-decoration:none;">soporte@afroeventos.com</a>
      </p>
    </td>
  </tr>`;

  return baseLayout(content, `Tu evento "${p.eventTitle}" ha sido cancelado. Información sobre tu compra.`);
}
