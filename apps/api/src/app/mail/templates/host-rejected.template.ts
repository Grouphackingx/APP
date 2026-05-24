import { baseLayout, ctaButton } from './base.layout';

interface HostRejectedData {
  name: string;
  organizationName: string;
  reason?: string;
  siteUrl: string;
}

export function hostRejectedTemplate({ name, organizationName, reason, siteUrl }: HostRejectedData): string {
  const firstName = name.split(' ')[0];

  const content = `
    <!-- HERO -->
    <tr>
      <td style="background-color:#111318;padding:52px 40px 36px;text-align:center;" class="pd-mobile">
        <div style="display:inline-block;width:64px;height:64px;background:#1a1010;border:2px solid #374151;
                    border-radius:50%;text-align:center;line-height:64px;font-size:28px;margin-bottom:24px;">📋</div>
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;">
          Actualización de tu solicitud
        </p>
        <h1 class="hero-text" style="margin:0 0 16px;font-size:28px;font-weight:900;line-height:1.2;color:#ffffff;letter-spacing:-0.5px;">
          Hola, ${firstName}.<br/>Tenemos novedades sobre tu solicitud.
        </h1>
        <p style="margin:0 auto;max-width:440px;font-size:15px;line-height:1.7;color:#9ca3af;">
          Después de revisar la solicitud de <strong style="color:#e5e7eb;">${organizationName}</strong>, nuestro equipo no pudo aprobarla en este momento.
        </p>
      </td>
    </tr>

    ${reason ? `
    <!-- REASON BOX -->
    <tr>
      <td style="background-color:#111318;padding:0 40px 28px;" class="pd-mobile">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="background:#120d0d;border:1px solid #2d1b1b;border-left:3px solid #ef4444;
                        border-radius:8px;padding:20px 24px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#ef4444;">
                Motivo de la decisión
              </p>
              <p style="margin:0;font-size:14px;color:#d1d5db;line-height:1.65;">${reason}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ` : ''}

    <!-- OPTIONS -->
    <tr>
      <td style="background-color:#111318;padding:${reason ? '4px' : '0'} 40px 32px;" class="pd-mobile">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="background:#0f1318;border:1px solid #1e2229;border-radius:12px;padding:24px;">
              <p style="margin:0 0 16px;font-size:14px;font-weight:700;color:#e5e7eb;">¿Qué puedes hacer ahora?</p>
              ${optionItem('📧', 'Contáctanos', 'Escríbenos a <a href="mailto:soporte@afroeventos.com" style="color:#6AC44D;text-decoration:none;">soporte@afroeventos.com</a> para conocer los detalles y cómo resolverlos.')}
              ${optionItem('📝', 'Vuelve a aplicar', 'Una vez que resuelvas las observaciones, puedes enviar una nueva solicitud de organizador.')}
              ${optionItem('🎵', 'Sigue disfrutando', 'Tu cuenta de asistente sigue activa — puedes seguir comprando entradas y explorando eventos.')}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="background-color:#111318;padding:4px 40px 48px;text-align:center;" class="pd-mobile">
        ${ctaButton('Explorar eventos como asistente', `${siteUrl}/`)}
        <p style="margin:20px 0 0;font-size:13px;color:#4b5563;">
          ¿Tienes preguntas? <a href="mailto:soporte@afroeventos.com" style="color:#6AC44D;text-decoration:none;">soporte@afroeventos.com</a>
        </p>
      </td>
    </tr>
  `;

  return baseLayout(content, `Tenemos una actualización sobre la solicitud de ${organizationName} en AfroEventos.`);
}

function optionItem(icon: string, title: string, desc: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:14px;">
    <tr>
      <td width="32" valign="top" style="padding-right:12px;font-size:18px;line-height:1;">${icon}</td>
      <td valign="top">
        <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#e5e7eb;">${title}</p>
        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">${desc}</p>
      </td>
    </tr>
  </table>`;
}
