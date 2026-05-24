import { baseLayout, ctaButton } from './base.layout';

interface ResetPasswordData {
  name: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export function resetPasswordTemplate({ name, resetUrl, expiresInMinutes }: ResetPasswordData): string {
  const firstName = name.split(' ')[0];

  const content = `
    <!-- HERO -->
    <tr>
      <td style="background-color:#111318;padding:52px 40px 40px;text-align:center;" class="pd-mobile">
        <div style="display:inline-block;width:72px;height:72px;background:#13100a;border:2px solid #f59e0b;
                    border-radius:50%;text-align:center;line-height:72px;font-size:32px;margin-bottom:24px;">🔑</div>
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#f59e0b;">
          Recuperar contraseña
        </p>
        <h1 style="margin:0 0 16px;font-size:28px;font-weight:900;line-height:1.2;color:#ffffff;letter-spacing:-0.5px;">
          Hola, ${firstName}.<br/>Aquí está tu enlace de recuperación.
        </h1>
        <p style="margin:0 auto;max-width:420px;font-size:15px;line-height:1.7;color:#9ca3af;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón para crear una nueva.
        </p>
      </td>
    </tr>

    <!-- URGENCIA -->
    <tr>
      <td style="background-color:#111318;padding:0 40px 24px;" class="pd-mobile">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="background:#13100a;border:1px solid #2d2010;border-radius:10px;padding:14px 20px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#f59e0b;">
                ⏱ Este enlace es válido por <strong>${expiresInMinutes} minutos</strong> — úsalo pronto.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="background-color:#111318;padding:4px 40px 28px;text-align:center;" class="pd-mobile">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
          <tr>
            <td style="border-radius:10px;background-color:#f59e0b;">
              <a href="${resetUrl}" target="_blank"
                 style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;
                        color:#000000;text-decoration:none;letter-spacing:0.3px;border-radius:10px;">
                Restablecer mi contraseña →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ALTERNATIVA -->
    <tr>
      <td style="background-color:#111318;padding:0 40px 28px;" class="pd-mobile">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="background:#0f1318;border:1px solid #1e2229;border-radius:10px;padding:20px 24px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#6b7280;">
                ¿El botón no funciona? Copia este enlace:
              </p>
              <p style="margin:0;font-size:12px;color:#4b5563;word-break:break-all;font-family:monospace;
                         background:#0b0d10;padding:10px 12px;border-radius:6px;border:1px solid #1a1f26;">
                ${resetUrl}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- AVISO -->
    <tr>
      <td style="background-color:#111318;padding:0 40px 44px;" class="pd-mobile">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="background:#120d0d;border:1px solid #2d1b1b;border-left:3px solid #ef4444;
                        border-radius:8px;padding:16px 20px;">
              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                🔒 <strong style="color:#e5e7eb;">¿No solicitaste esto?</strong> Ignora este correo. Tu contraseña actual no cambiará. Si crees que alguien intenta acceder a tu cuenta, contáctanos.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return baseLayout(content, `${firstName}, usa este enlace para restablecer tu contraseña de AfroEventos.`);
}
