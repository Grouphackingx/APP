import { baseLayout, ctaButton, iconCircle } from './base.layout';

interface MemberInvitationProps {
  memberName: string;
  organizationName: string;
  memberRole: 'ADMIN' | 'STAFF';
  email: string;
  password: string;
  loginUrl: string;
}

export function memberInvitationTemplate(p: MemberInvitationProps): string {
  const roleLabel = p.memberRole === 'ADMIN' ? 'Administrador' : 'Staff';
  const roleDesc = p.memberRole === 'ADMIN'
    ? 'Tendrás acceso completo para gestionar eventos, ver reportes y administrar el equipo.'
    : 'Podrás validar entradas, consultar listas de asistentes y apoyar la operación de los eventos.';

  const content = `
  <!-- HERO -->
  <tr>
    <td bgcolor="#111318" style="background:linear-gradient(160deg,#0a1a10 0%,#111318 100%);padding:48px 40px 36px;text-align:center;border-top:3px solid #6AC44D;">
      ${iconCircle('🎟️', '#0f1a10', 'rgba(106,196,77,0.4)')}
      <h1 class="hero-text" style="margin:0 0 12px;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">
        ¡Te invitaron al equipo!
      </h1>
      <p style="margin:0;font-size:16px;color:#9ca3af;line-height:1.5;">
        Hola <strong style="color:#ffffff;">${p.memberName}</strong>, ahora formas parte de <strong style="color:#6AC44D;">${p.organizationName}</strong>.
      </p>
    </td>
  </tr>

  <!-- BODY -->
  <tr>
    <td style="background-color:#111318;padding:36px 40px 32px;" class="pd-mobile">

      <!-- Role Badge -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;">
        <tr>
          <td style="background:rgba(106,196,77,0.08);border:1px solid rgba(106,196,77,0.2);border-radius:10px;padding:16px 20px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1px;color:#6AC44D;text-transform:uppercase;">Tu rol</p>
            <p style="margin:0 0 8px;font-size:18px;font-weight:800;color:#ffffff;">${roleLabel} · ${p.organizationName}</p>
            <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">${roleDesc}</p>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 24px;font-size:15px;color:#d1d5db;line-height:1.7;">
        Usa las credenciales a continuación para acceder al panel. Te recomendamos cambiar tu contraseña después del primer inicio de sesión.
      </p>

      <!-- Credentials Box -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;">
        <tr>
          <td style="background:#0d0f13;border:1px solid #1e2229;border-radius:12px;padding:24px;">
            <p style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:1px;color:#6b7280;text-transform:uppercase;">Tus credenciales de acceso</p>

            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding-bottom:12px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Correo electrónico</p>
                  <p style="margin:0;font-size:15px;font-weight:600;color:#6AC44D;font-family:monospace;">${p.email}</p>
                </td>
              </tr>
              <tr>
                <td style="border-top:1px solid #1e2229;padding-top:12px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Contraseña temporal</p>
                  <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;font-family:monospace;background:#1a1c20;display:inline-block;padding:6px 12px;border-radius:6px;letter-spacing:1px;">${p.password}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Security tip -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;">
        <tr>
          <td style="background:#0d1117;border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;padding:14px 18px;">
            <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
              🔒 <strong style="color:#f59e0b;">Recomendación:</strong> Cambia tu contraseña temporal desde la sección de perfil una vez que hayas ingresado.
            </p>
          </td>
        </tr>
      </table>

      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td align="center">
            ${ctaButton('Acceder al panel', p.loginUrl)}
          </td>
        </tr>
      </table>
    </td>
  </tr>`;

  return baseLayout(content, `Fuiste agregado al equipo de ${p.organizationName}. Aquí están tus credenciales de acceso.`);
}
