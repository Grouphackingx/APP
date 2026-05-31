import { baseLayout, ctaButton, iconCircle } from './base.layout';

interface AccountCreatedByAdminProps {
  name: string;
  email: string;
  password: string;
  role: 'HOST' | 'ADMIN' | 'EDITOR';
  organizationName?: string;
  loginUrl: string;
}

export function accountCreatedByAdminTemplate(p: AccountCreatedByAdminProps): string {
  const roleConfig: Record<string, { label: string; desc: string; icon: string; color: string }> = {
    HOST: {
      label: 'Organizador',
      desc: `Tu cuenta de organizador para <strong style="color:#ffffff;">${p.organizationName || 'tu organización'}</strong> ha sido creada y activada. Ya puedes crear eventos, gestionar zonas y acceder a tu panel.`,
      icon: '🎪',
      color: '#6AC44D',
    },
    ADMIN: {
      label: 'Administrador Global',
      desc: 'Tu cuenta de administrador global te da acceso completo al panel de control: gestión de organizadores, planes, usuarios y configuración del sistema.',
      icon: '🛡️',
      color: '#6AC44D',
    },
    EDITOR: {
      label: 'Editor',
      desc: 'Tu cuenta de editor te permite gestionar contenido, revisar eventos y apoyar la operación de la plataforma desde el panel de control.',
      icon: '✏️',
      color: '#6b7280',
    },
  };

  const cfg = roleConfig[p.role] || roleConfig['ADMIN'];

  const content = `
  <!-- HERO -->
  <tr>
    <td bgcolor="#111318" style="background:linear-gradient(160deg,#0a1a10 0%,#111318 100%);padding:48px 40px 36px;text-align:center;border-top:3px solid ${cfg.color};">
      ${iconCircle(cfg.icon, '#0f1a10', 'rgba(106,196,77,0.4)')}
      <h1 class="hero-text" style="margin:0 0 12px;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">
        Tu cuenta está lista
      </h1>
      <p style="margin:0;font-size:16px;color:#9ca3af;line-height:1.5;">
        Hola <strong style="color:#ffffff;">${p.name}</strong>, el equipo de AfroEventos creó tu acceso.
      </p>
    </td>
  </tr>

  <!-- BODY -->
  <tr>
    <td style="background-color:#111318;padding:36px 40px 32px;" class="pd-mobile">

      <!-- Role info -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;">
        <tr>
          <td style="background:rgba(106,196,77,0.06);border:1px solid rgba(106,196,77,0.15);border-radius:10px;padding:16px 20px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1px;color:${cfg.color};text-transform:uppercase;">Tu rol</p>
            <p style="margin:0 0 8px;font-size:17px;font-weight:800;color:#ffffff;">${cfg.label}</p>
            <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">${cfg.desc}</p>
          </td>
        </tr>
      </table>

      <!-- Credentials -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;">
        <tr>
          <td style="background:#0d0f13;border:1px solid #1e2229;border-radius:12px;padding:24px;">
            <p style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:1px;color:#6b7280;text-transform:uppercase;">Credenciales de acceso</p>

            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding-bottom:14px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Correo electrónico</p>
                  <p style="margin:0;font-size:15px;font-weight:600;color:#6AC44D;font-family:monospace;">${p.email}</p>
                </td>
              </tr>
              <tr>
                <td style="border-top:1px solid #1e2229;padding-top:14px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Contraseña temporal</p>
                  <p style="margin:0;font-size:16px;font-weight:700;color:#ffffff;font-family:monospace;background:#1a1c20;display:inline-block;padding:8px 14px;border-radius:6px;letter-spacing:1.5px;">${p.password}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Security warning -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;">
        <tr>
          <td style="background:#0d1117;border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;padding:14px 18px;">
            <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
              🔒 <strong style="color:#f59e0b;">Importante:</strong> Esta contraseña es temporal. Cámbiala desde tu perfil tan pronto como accedas al panel. No la compartas con nadie.
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

  return baseLayout(content, `Tu cuenta en AfroEventos está lista. Aquí están tus credenciales de acceso.`);
}
