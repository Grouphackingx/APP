import { baseLayout, ctaButton, divider, formatDate, formatTime } from './base.layout';
import { TicketInfo } from '../mail.service';

interface PurchaseConfirmationData {
  name: string;
  tickets: TicketInfo[];
  totalAmount: number;
  orderId: string;
  siteUrl: string;
}

export function purchaseConfirmationTemplate({
  name, tickets, totalAmount, orderId, siteUrl,
}: PurchaseConfirmationData): string {
  const firstName = name.split(' ')[0];
  const shortOrderId = orderId.slice(0, 8).toUpperCase();

  // Group tickets by event
  const byEvent = new Map<string, { title: string; date: string; location: string; city: string; tickets: TicketInfo[] }>();
  for (const t of tickets) {
    const key = t.eventTitle;
    if (!byEvent.has(key)) {
      byEvent.set(key, { title: t.eventTitle, date: t.eventDate, location: t.eventLocation, city: t.eventCity, tickets: [] });
    }
    byEvent.get(key)!.tickets.push(t);
  }

  const totalFree = totalAmount === 0;

  const content = `
    <!-- HERO -->
    <tr>
      <td style="background:linear-gradient(160deg,#111318 0%,#0a1612 100%);padding:48px 40px 36px;" class="pd-mobile">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#6AC44D;">
          Compra confirmada
        </p>
        <h1 class="hero-text" style="margin:0 0 12px;font-size:30px;font-weight:900;line-height:1.2;color:#ffffff;letter-spacing:-0.5px;">
          ¡Tus entradas están listas, ${firstName}! 🎟️
        </h1>
        <p style="margin:0;font-size:15px;line-height:1.6;color:#9ca3af;">
          ${totalFree
            ? 'Reservaste tus entradas de forma exitosa. Recuerda llevar tu código QR el día del evento.'
            : `Recibimos tu pago de <strong style="color:#6AC44D;">$${totalAmount.toFixed(2)}</strong> y tus entradas están confirmadas. ¡Nos vemos en el evento!`
          }
        </p>
      </td>
    </tr>

    <!-- ORDER ID -->
    <tr>
      <td style="background-color:#111318;padding:0 40px 24px;" class="pd-mobile">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="background:#0f1318;border:1px solid #1e2229;border-radius:10px;padding:16px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <p style="margin:0 0 2px;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#4b5563;">Número de orden</p>
                    <p style="margin:0;font-size:18px;font-weight:800;color:#6AC44D;letter-spacing:1px;font-family:monospace;">#${shortOrderId}</p>
                  </td>
                  <td align="right">
                    <p style="margin:0 0 2px;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#4b5563;">Total pagado</p>
                    <p style="margin:0;font-size:18px;font-weight:800;color:#e5e7eb;">${totalFree ? 'GRATIS' : `$${totalAmount.toFixed(2)}`}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    ${divider()}

    <!-- TICKETS BY EVENT -->
    ${Array.from(byEvent.values()).map(event => `
    <tr>
      <td style="background-color:#111318;padding:28px 40px 8px;" class="pd-mobile">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <!-- Event header -->
          <tr>
            <td style="padding-bottom:16px;">
              <p style="margin:0 0 4px;font-size:17px;font-weight:800;color:#ffffff;">${event.title}</p>
              ${event.date ? `<p style="margin:0 0 2px;font-size:13px;color:#6AC44D;">📅 ${formatDate(event.date)} · ${formatTime(event.date)}</p>` : ''}
              ${event.location ? `<p style="margin:0;font-size:13px;color:#6b7280;">📍 ${event.location}${event.city ? `, ${event.city}` : ''}</p>` : ''}
            </td>
          </tr>
          <!-- Ticket list -->
          ${event.tickets.map((t, i) => `
          <tr>
            <td style="padding-bottom:10px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="background:#0f1318;border:1px solid #1e2229;border-left:3px solid #6AC44D;
                              border-radius:8px;padding:14px 18px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td>
                          <p style="margin:0 0 3px;font-size:13px;font-weight:700;color:#e5e7eb;">
                            Entrada ${i + 1} · ${t.zoneName}
                          </p>
                          ${t.seatNumber ? `<p style="margin:0;font-size:12px;color:#6b7280;">Asiento: <span style="color:#9ca3af;font-weight:600;">${t.seatNumber}</span></p>` : ''}
                        </td>
                        <td align="right" style="white-space:nowrap;">
                          <p style="margin:0;font-size:11px;color:#4b5563;font-family:monospace;">#${t.ticketId.slice(0, 8)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `).join('')}
        </table>
      </td>
    </tr>
    `).join('')}

    ${divider()}

    <!-- HOW TO USE -->
    <tr>
      <td style="background-color:#111318;padding:28px 40px;" class="pd-mobile">
        <p style="margin:0 0 16px;font-size:13px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#6b7280;">
          Cómo usar tus entradas
        </p>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          ${howToRow('1', 'Abre tu cuenta en AfroEventos', 'Ingresa a "Mis Tickets" desde el menú de tu perfil.')}
          ${howToRow('2', 'Muestra el código QR', 'En la entrada del evento, el staff escaneará tu código QR.')}
          ${howToRow('3', '¡Disfruta!', 'Una vez validado, estás dentro. ¡Pásatela increíble!')}
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="background-color:#111318;padding:8px 40px 48px;text-align:center;" class="pd-mobile">
        ${ctaButton('Ver mis entradas →', `${siteUrl}/my-tickets`)}
        <p style="margin:20px 0 0;font-size:12px;color:#374151;line-height:1.6;">
          ¿Problemas con tu compra? Escríbenos a <a href="mailto:soporte@afroeventos.com" style="color:#6AC44D;text-decoration:none;">soporte@afroeventos.com</a>
        </p>
      </td>
    </tr>
  `;

  return baseLayout(content, `¡${firstName}, tus ${tickets.length} entrada${tickets.length !== 1 ? 's' : ''} para ${tickets[0]?.eventTitle} están listas!`);
}

function howToRow(num: string, title: string, desc: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:14px;">
    <tr>
      <td width="36" valign="top" style="padding-right:14px;padding-top:1px;">
        <div style="width:28px;height:28px;background:#0f1a10;border:1px solid #6AC44D;border-radius:50%;
                    text-align:center;line-height:28px;font-size:12px;font-weight:700;color:#6AC44D;">${num}</div>
      </td>
      <td valign="top">
        <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#e5e7eb;">${title}</p>
        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">${desc}</p>
      </td>
    </tr>
  </table>`;
}
