import { baseLayout, ctaButton, divider } from './base.layout';

interface WelcomeHostData {
  name: string;
  organizationName: string;
  hostUrl: string;
}

export function welcomeHostTemplate({ name, organizationName, hostUrl }: WelcomeHostData): string {
  const firstName = name.split(' ')[0];

  const content = `
    <!-- HERO -->
    <tr>
      <td style="background:linear-gradient(160deg,#111318 0%,#0f1510 100%);padding:48px 40px 36px;" class="pd-mobile">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#6AC44D;">
          Solicitud recibida
        </p>
        <h1 class="hero-text" style="margin:0 0 16px;font-size:30px;font-weight:900;line-height:1.2;color:#ffffff;letter-spacing:-0.5px;">
          ¡Gracias, ${firstName}!<br/>Estamos revisando tu solicitud.
        </h1>
        <p style="margin:0;font-size:15px;line-height:1.7;color:#9ca3af;">
          Recibimos tu solicitud para registrar <strong style="color:#e5e7eb;">${organizationName}</strong> como organizador en AfroEventos. Nuestro equipo la revisará en las próximas <strong style="color:#6AC44D;">24 a 48 horas hábiles</strong>.
        </p>
      </td>
    </tr>

    <!-- STATUS TRACKER -->
    <tr>
      <td style="background-color:#111318;padding:28px 40px;" class="pd-mobile">
        <p style="margin:0 0 20px;font-size:13px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#6b7280;">
          ¿Qué sigue?
        </p>
        ${stepRow('1', '✅', 'Solicitud enviada', 'Tu información llegó correctamente a nuestro equipo.', true)}
        ${stepRow('2', '🔍', 'Revisión en proceso', 'Verificamos los datos de tu organización. Esto toma 24–48 h.', false)}
        ${stepRow('3', '🎉', 'Cuenta activada', 'Recibirás un correo con acceso a tu panel de organizador.', false)}
      </td>
    </tr>

    ${divider()}

    <!-- TIP -->
    <tr>
      <td style="background-color:#111318;padding:28px 40px;" class="pd-mobile">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="background:#0f1a10;border:1px solid #1a3a1a;border-radius:12px;padding:20px 24px;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#6AC44D;">💡 Mientras esperas</p>
              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                Puedes revisar nuestra guía de mejores prácticas para organizar eventos exitosos, explorar cómo funciona el sistema de tickets, o contactarnos si tienes alguna pregunta.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="background-color:#111318;padding:4px 40px 44px;text-align:center;" class="pd-mobile">
        <p style="margin:0 0 20px;font-size:13px;color:#6b7280;">
          Si ya tienes cuenta aprobada, accede a tu panel:
        </p>
        ${ctaButton('Ir al Panel de Organizador', `${hostUrl}/login`)}
      </td>
    </tr>
  `;

  return baseLayout(content, `Tu solicitud para ${organizationName} fue recibida. La revisaremos en 24–48 h.`);
}

function stepRow(num: string, icon: string, title: string, desc: string, active: boolean): string {
  const color = active ? '#6AC44D' : '#374151';
  const bgColor = active ? '#0f1a10' : '#111a13';
  const textColor = active ? '#e5e7eb' : '#6b7280';
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:16px;">
    <tr>
      <td width="40" valign="top" style="padding-right:14px;padding-top:2px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td width="32" height="32" align="center" valign="middle" bgcolor="${bgColor}"
                style="background-color:${bgColor};border:2px solid ${color};border-radius:16px;
                       font-size:13px;font-weight:700;color:${color};text-align:center;
                       vertical-align:middle;line-height:32px;font-family:Arial,sans-serif;">
              ${active ? icon : num}
            </td>
          </tr>
        </table>
      </td>
      <td valign="top">
        <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:${textColor};font-family:Arial,sans-serif;">${title}</p>
        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;font-family:Arial,sans-serif;">${desc}</p>
      </td>
    </tr>
  </table>`;
}
