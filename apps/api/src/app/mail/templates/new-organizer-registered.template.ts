import { baseLayout, ctaButton, divider, iconCircle } from './base.layout';

interface NewOrganizerData {
  adminName: string;
  organizerName: string;
  organizerEmail: string;
  organizationName: string;
  city?: string;
  province?: string;
  adminUrl: string;
}

export function newOrganizerRegisteredTemplate({
  adminName,
  organizerName,
  organizerEmail,
  organizationName,
  city,
  province,
  adminUrl,
}: NewOrganizerData): string {
  const firstName = adminName.split(' ')[0];
  const reviewUrl = `${adminUrl}?view=organizers`;
  const location = [city, province].filter(Boolean).join(', ');

  const content = `
    <!-- HERO -->
    <tr>
      <td bgcolor="#111318" style="background:linear-gradient(160deg,#111318 0%,#0d1520 100%);padding:52px 40px 40px;text-align:center;" class="pd-mobile">
        ${iconCircle('🔔', '#0e1520', '#6AC44D')}
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#6AC44D;">
          Pendiente de revisión
        </p>
        <h1 class="hero-text" style="margin:0 0 16px;font-size:28px;font-weight:900;line-height:1.2;color:#ffffff;letter-spacing:-0.5px;">
          Nueva solicitud de organizador
        </h1>
        <p style="margin:0 auto;max-width:440px;font-size:15px;line-height:1.7;color:#9ca3af;">
          Hola <strong style="color:#e5e7eb;">${firstName}</strong>, un nuevo organizador se ha registrado y está esperando tu revisión.
        </p>
      </td>
    </tr>

    <!-- ORGANIZER CARD -->
    <tr>
      <td style="background-color:#111318;padding:32px 40px;" class="pd-mobile">
        <p style="margin:0 0 16px;font-size:13px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#6b7280;">
          Datos del solicitante
        </p>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
               style="background-color:#0d0f13;border:1px solid #1e2229;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:24px 28px;">
              ${infoRow('🏢', 'Organización', organizationName)}
              ${infoRow('👤', 'Representante', organizerName)}
              ${infoRow('✉️', 'Correo', organizerEmail)}
              ${location ? infoRow('📍', 'Ubicación', location) : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    ${divider()}

    <!-- CTA -->
    <tr>
      <td style="background-color:#111318;padding:32px 40px 48px;text-align:center;" class="pd-mobile">
        <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#e5e7eb;">
          Revisa el perfil y toma una decisión
        </p>
        <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.6;">
          Desde el panel puedes ver todos los detalles, aprobar o rechazar la solicitud.
        </p>
        ${ctaButton('Revisar solicitud →', reviewUrl)}
        <p style="margin:24px 0 0;font-size:12px;color:#4b5563;line-height:1.6;">
          O accede directamente a
          <a href="${reviewUrl}" style="color:#6AC44D;text-decoration:none;">${adminUrl}</a>
          → sección <strong style="color:#6b7280;">Organizadores</strong>
        </p>
      </td>
    </tr>
  `;

  return baseLayout(
    content,
    `${organizationName} solicitó registrarse como organizador en AfroEventos. Revisa y aprueba desde el panel.`,
  );
}

function infoRow(icon: string, label: string, value: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:16px;">
    <tr>
      <td width="28" valign="middle" style="padding-right:12px;font-size:16px;">${icon}</td>
      <td valign="middle">
        <span style="font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#4b5563;">${label}</span><br/>
        <span style="font-size:14px;font-weight:600;color:#e5e7eb;">${value}</span>
      </td>
    </tr>
  </table>`;
}
