import { baseLayout, ctaButton, iconCircle } from './base.layout';

interface VerifyEmailData {
  name: string;
  verifyUrl: string;
  expiresInHours: number;
}

export function verifyEmailTemplate({ name, verifyUrl, expiresInHours }: VerifyEmailData): string {
  const firstName = name.split(' ')[0];

  const content = `
    <!-- HERO -->
    <tr>
      <td bgcolor="#111318" style="background:linear-gradient(160deg,#111318 0%,#0c150e 100%);padding:52px 40px 40px;text-align:center;" class="pd-mobile">
        ${iconCircle('✉️', '#0f1a10', '#6AC44D')}
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#6AC44D;">
          Verifica tu correo
        </p>
        <h1 style="margin:0 0 16px;font-size:28px;font-weight:900;line-height:1.2;color:#ffffff;letter-spacing:-0.5px;">
          Un paso más, ${firstName}.
        </h1>
        <p style="margin:0 auto;max-width:400px;font-size:15px;line-height:1.7;color:#9ca3af;">
          Para activar tu cuenta y empezar a comprar entradas, necesitamos confirmar que este correo te pertenece.
        </p>
      </td>
    </tr>

    <!-- CTA PRINCIPAL -->
    <tr>
      <td style="background-color:#111318;padding:32px 40px;text-align:center;" class="pd-mobile">
        ${ctaButton('Verificar mi correo →', verifyUrl)}
        <p style="margin:20px 0 0;font-size:13px;color:#4b5563;">
          Este enlace expira en <strong style="color:#9ca3af;">${expiresInHours} horas</strong>.
        </p>
      </td>
    </tr>

    <!-- ALTERNATIVA LINK -->
    <tr>
      <td style="background-color:#111318;padding:0 40px 32px;" class="pd-mobile">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="background:#0f1318;border:1px solid #1e2229;border-radius:10px;padding:20px 24px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#6b7280;">
                ¿El botón no funciona? Copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:0;font-size:12px;color:#4b5563;word-break:break-all;font-family:monospace;
                         background:#0b0d10;padding:10px 12px;border-radius:6px;border:1px solid #1a1f26;">
                ${verifyUrl}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- AVISO DE SEGURIDAD -->
    <tr>
      <td style="background-color:#111318;padding:0 40px 44px;" class="pd-mobile">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="background:#120d0d;border:1px solid #2d1b1b;border-left:3px solid #f59e0b;
                        border-radius:8px;padding:16px 20px;">
              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                🔒 <strong style="color:#e5e7eb;">¿No creaste esta cuenta?</strong> Ignora este correo — no se realizará ninguna acción. Tu seguridad es nuestra prioridad.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return baseLayout(content, `${firstName}, verifica tu correo para activar tu cuenta en AfroEventos.`);
}
