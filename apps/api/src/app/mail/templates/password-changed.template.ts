import { baseLayout, ctaButton, iconCircle } from './base.layout';

interface PasswordChangedProps {
  name: string;
  resetUrl: string;
}

export function passwordChangedTemplate(p: PasswordChangedProps): string {
  const changedAt = new Date().toLocaleString('es-EC', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const content = `
  <!-- HERO -->
  <tr>
    <td bgcolor="#111318" style="background:linear-gradient(160deg,#0a1a10 0%,#111318 100%);padding:48px 40px 36px;text-align:center;border-top:3px solid #6AC44D;">
      ${iconCircle('🔐', '#0f1a10', 'rgba(106,196,77,0.4)')}
      <h1 class="hero-text" style="margin:0 0 12px;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">
        Contraseña actualizada
      </h1>
      <p style="margin:0;font-size:16px;color:#9ca3af;line-height:1.5;">
        Hola <strong style="color:#ffffff;">${p.name}</strong>, tu contraseña fue cambiada exitosamente.
      </p>
    </td>
  </tr>

  <!-- BODY -->
  <tr>
    <td style="background-color:#111318;padding:36px 40px 32px;" class="pd-mobile">

      <!-- Timestamp -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;">
        <tr>
          <td style="background:#0d0f13;border:1px solid #1e2229;border-radius:10px;padding:16px 20px;">
            <p style="margin:0 0 4px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Cambio registrado el</p>
            <p style="margin:0;font-size:14px;font-weight:600;color:#d1d5db;">${changedAt}</p>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 24px;font-size:15px;color:#d1d5db;line-height:1.7;">
        Si fuiste tú quien realizó este cambio, no necesitas hacer nada más. Tu cuenta está segura.
      </p>

      <!-- Alert: not me -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;">
        <tr>
          <td style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:20px 24px;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#ef4444;">⚠️ ¿No fuiste tú?</p>
            <p style="margin:0 0 16px;font-size:13px;color:#9ca3af;line-height:1.6;">
              Si no realizaste este cambio, alguien más podría haber accedido a tu cuenta. Actúa de inmediato: restablece tu contraseña y revisa tu actividad reciente.
            </p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="border-radius:8px;background:#ef4444;">
                  <a href="${p.resetUrl}" target="_blank"
                     style="display:inline-block;padding:10px 20px;font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">
                    Restablecer contraseña ahora →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Security tips -->
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Consejos de seguridad</p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;">
        ${[
          ['🔑', 'Usa contraseñas únicas para cada plataforma.'],
          ['📱', 'Activa la autenticación de dos factores cuando esté disponible.'],
          ['🚫', 'Nunca compartas tu contraseña con nadie, ni con nuestro equipo.'],
        ].map(([icon, tip]) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #1a1c20;">
            <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.5;">${icon} &nbsp;${tip}</p>
          </td>
        </tr>`).join('')}
      </table>

      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td align="center">
            ${ctaButton('Ir a mi cuenta', p.resetUrl.replace('/reset-password', ''))}
          </td>
        </tr>
      </table>
    </td>
  </tr>`;

  return baseLayout(content, 'Tu contraseña de AfroEventos fue actualizada. Si no fuiste tú, actúa ahora.');
}
