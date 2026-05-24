import { baseLayout, ctaButton, formatDate, formatTime } from './base.layout';

interface EventRescheduledProps {
  buyerName: string;
  eventTitle: string;
  oldDate: string;
  newDate: string;
  newLocation: string;
  newCity: string;
  siteUrl: string;
}

export function eventRescheduledTemplate(p: EventRescheduledProps): string {
  const content = `
  <!-- HERO -->
  <tr>
    <td style="background:linear-gradient(160deg,#0d1117 0%,#111318 100%);padding:48px 40px 36px;text-align:center;border-top:3px solid #f59e0b;">
      <div style="display:inline-block;width:72px;height:72px;border-radius:50%;background:rgba(245,158,11,0.12);border:2px solid rgba(245,158,11,0.35);line-height:72px;font-size:34px;margin-bottom:20px;">📅</div>
      <h1 class="hero-text" style="margin:0 0 12px;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">
        El evento fue reprogramado
      </h1>
      <p style="margin:0;font-size:16px;color:#9ca3af;line-height:1.5;">
        Hola <strong style="color:#ffffff;">${p.buyerName}</strong>, hay una actualización importante sobre tu evento.
      </p>
    </td>
  </tr>

  <!-- BODY -->
  <tr>
    <td style="background-color:#111318;padding:36px 40px 32px;" class="pd-mobile">

      <p style="margin:0 0 24px;font-size:15px;color:#d1d5db;line-height:1.7;">
        El organizador de <strong style="color:#ffffff;">${p.eventTitle}</strong> ha actualizado los detalles del evento. Tus entradas siguen siendo válidas — solo guarda los nuevos datos.
      </p>

      <!-- Comparison Table -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;border-radius:12px;overflow:hidden;border:1px solid #1e2229;">
        <!-- Header -->
        <tr>
          <td width="50%" style="background:#1a1c20;padding:12px 20px;font-size:11px;font-weight:700;letter-spacing:1px;color:#6b7280;text-transform:uppercase;border-bottom:1px solid #1e2229;">
            Fecha anterior
          </td>
          <td width="50%" style="background:#1a1c20;padding:12px 20px;font-size:11px;font-weight:700;letter-spacing:1px;color:#6AC44D;text-transform:uppercase;border-bottom:1px solid #1e2229;">
            Nueva fecha ✓
          </td>
        </tr>
        <!-- Dates -->
        <tr>
          <td style="background:#111318;padding:16px 20px;border-right:1px solid #1e2229;border-bottom:1px solid #1e2229;">
            <p style="margin:0;font-size:14px;color:#6b7280;text-decoration:line-through;line-height:1.5;">
              ${formatDate(p.oldDate)}<br/>
              <span style="font-size:13px;">${formatTime(p.oldDate)}</span>
            </p>
          </td>
          <td style="background:#0d1a0d;padding:16px 20px;border-bottom:1px solid #1e2229;">
            <p style="margin:0;font-size:14px;font-weight:700;color:#ffffff;line-height:1.5;">
              ${formatDate(p.newDate)}<br/>
              <span style="font-size:13px;color:#6AC44D;">${formatTime(p.newDate)}</span>
            </p>
          </td>
        </tr>
        <!-- Location -->
        <tr>
          <td style="background:#111318;padding:16px 20px;border-right:1px solid #1e2229;">
            <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Lugar</p>
            <p style="margin:0;font-size:14px;color:#6b7280;">—</p>
          </td>
          <td style="background:#0d1a0d;padding:16px 20px;">
            <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Lugar</p>
            <p style="margin:0;font-size:14px;font-weight:600;color:#ffffff;">${p.newLocation}<br/><span style="font-size:13px;color:#6AC44D;">${p.newCity}</span></p>
          </td>
        </tr>
      </table>

      <!-- Ticket still valid notice -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;">
        <tr>
          <td style="background:rgba(106,196,77,0.06);border:1px solid rgba(106,196,77,0.2);border-radius:10px;padding:16px 20px;">
            <p style="margin:0;font-size:14px;color:#d1d5db;line-height:1.6;">
              ✅ &nbsp;<strong style="color:#6AC44D;">Tus entradas son válidas</strong> para la nueva fecha y lugar. No necesitas hacer nada — solo presenta tu QR el día del evento.
            </p>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.6;">
        Si la nueva fecha no te conviene, contacta al organizador directamente a través de la plataforma para consultar las opciones disponibles.
      </p>

      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td align="center">
            ${ctaButton('Ver mis entradas', `${p.siteUrl}/my-tickets`)}
          </td>
        </tr>
      </table>
    </td>
  </tr>`;

  return baseLayout(content, `"${p.eventTitle}" tiene una nueva fecha. Tus entradas siguen siendo válidas.`);
}
