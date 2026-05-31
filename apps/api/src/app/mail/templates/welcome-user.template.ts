import { baseLayout, ctaButton } from './base.layout';

interface WelcomeUserData {
  name: string;
  siteUrl: string;
}

export function welcomeUserTemplate({ name, siteUrl }: WelcomeUserData): string {
  const firstName = name.split(' ')[0];

  const content = `
    <!-- HERO -->
    <tr>
      <td style="background:linear-gradient(160deg,#111318 0%,#0f1a10 100%);padding:48px 40px 36px;" class="pd-mobile">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#6AC44D;">
          Bienvenido/a
        </p>
        <h1 class="hero-text" style="margin:0 0 16px;font-size:32px;font-weight:900;line-height:1.15;color:#ffffff;letter-spacing:-0.5px;">
          Hola, ${firstName}. 👋<br/>Tu cuenta está lista.
        </h1>
        <p style="margin:0;font-size:16px;line-height:1.7;color:#9ca3af;">
          Estás a un paso de vivir la música, el baile y la cultura afroecuatoriana como nunca antes. Descubre eventos únicos, compra tus entradas y guarda tus tickets directamente desde tu cuenta.
        </p>
      </td>
    </tr>

    <!-- FEATURES -->
    <tr>
      <td style="background-color:#111318;padding:32px 40px;" class="pd-mobile">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          ${featureRow('🎟️', 'Compra tus entradas en segundos', 'Selecciona tu zona, elige tus asientos y listo — todo en línea.')}
          ${featureRow('📱', 'Tus tickets siempre contigo', 'Accede a tus entradas con código QR directamente desde la app, sin imprimir nada.')}
          ${featureRow('🎵', 'Eventos que te mueven', 'Música afro, marimba, salsa, chontaduro y mucho más — curado para ti.')}
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="background-color:#111318;padding:8px 40px 44px;text-align:center;" class="pd-mobile">
        ${ctaButton('Explorar eventos', `${siteUrl}/`)}
      </td>
    </tr>
  `;

  return baseLayout(content, `¡Hola ${firstName}! Tu cuenta en AfroEventos está lista. Descubre los mejores eventos.`);
}

function featureRow(icon: string, title: string, desc: string): string {
  return `<tr>
    <td style="padding:0 0 20px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td width="44" valign="top" style="padding-right:16px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td width="40" height="40" align="center" valign="middle" bgcolor="#0f1a10"
                    style="background-color:#0f1a10;border:1px solid #1a3a1a;border-radius:10px;
                           font-size:18px;text-align:center;vertical-align:middle;line-height:40px;
                           font-family:Arial,sans-serif;">
                  ${icon}
                </td>
              </tr>
            </table>
          </td>
          <td valign="top">
            <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#e5e7eb;font-family:Arial,sans-serif;">${title}</p>
            <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;font-family:Arial,sans-serif;">${desc}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}
