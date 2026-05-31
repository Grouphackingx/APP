import { baseLayout, ctaButton, divider, iconCircle } from './base.layout';

interface HostApprovedData {
  name: string;
  organizationName: string;
  hostUrl: string;
}

export function hostApprovedTemplate({ name, organizationName, hostUrl }: HostApprovedData): string {
  const firstName = name.split(' ')[0];

  const content = `
    <!-- HERO BADGE -->
    <tr>
      <td bgcolor="#111318" style="background:linear-gradient(160deg,#111318 0%,#0a1a0a 100%);padding:52px 40px 40px;text-align:center;" class="pd-mobile">
        ${iconCircle('🎊', '#0f1a10', '#6AC44D')}
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#6AC44D;">
          Cuenta aprobada
        </p>
        <h1 class="hero-text" style="margin:0 0 16px;font-size:30px;font-weight:900;line-height:1.2;color:#ffffff;letter-spacing:-0.5px;">
          ¡Felicitaciones, ${firstName}!<br/>Ya eres organizador oficial.
        </h1>
        <p style="margin:0 auto;max-width:420px;font-size:15px;line-height:1.7;color:#9ca3af;">
          <strong style="color:#e5e7eb;">${organizationName}</strong> fue aprobada en AfroEventos. Ya puedes crear eventos, gestionar entradas y conectar con tu audiencia.
        </p>
      </td>
    </tr>

    <!-- WHAT YOU CAN DO -->
    <tr>
      <td style="background-color:#111318;padding:32px 40px;" class="pd-mobile">
        <p style="margin:0 0 20px;font-size:13px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#6b7280;">
          Tu panel incluye
        </p>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          ${featureRow('🎪', 'Crear y gestionar eventos', 'Configura zonas, precios, capacidad e imágenes desde tu dashboard.')}
          ${featureRow('🎟️', 'Control de entradas en tiempo real', 'Ve quién compró, valida tickets con QR y controla la asistencia.')}
          ${featureRow('👥', 'Gestiona tu equipo', 'Agrega miembros como staff o administradores de tu organización.')}
          ${featureRow('📊', 'Reportes y asistentes', 'Consulta el listado de compradores y métricas de tus eventos.')}
        </table>
      </td>
    </tr>

    ${divider()}

    <!-- CTA -->
    <tr>
      <td style="background-color:#111318;padding:32px 40px 48px;text-align:center;" class="pd-mobile">
        <p style="margin:0 0 24px;font-size:15px;color:#9ca3af;line-height:1.6;">
          Usa el correo y contraseña que registraste para acceder a tu panel.
        </p>
        ${ctaButton('Acceder a mi Panel →', `${hostUrl}/login`)}
        <p style="margin:24px 0 0;font-size:13px;color:#4b5563;">
          ¿Necesitas ayuda? Escríbenos a <a href="mailto:soporte@afroeventos.com" style="color:#6AC44D;text-decoration:none;">soporte@afroeventos.com</a>
        </p>
      </td>
    </tr>
  `;

  return baseLayout(content, `¡${firstName}, tu cuenta de organizador fue aprobada! Ya puedes crear eventos en AfroEventos.`);
}

function featureRow(icon: string, title: string, desc: string): string {
  return `<tr>
    <td style="padding-bottom:18px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td width="44" valign="top" style="padding-right:14px;">
            <div style="width:38px;height:38px;background:#0f1a10;border:1px solid #1a3a1a;
                        border-radius:9px;text-align:center;line-height:38px;font-size:17px;">${icon}</div>
          </td>
          <td valign="top">
            <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#e5e7eb;">${title}</p>
            <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">${desc}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}
