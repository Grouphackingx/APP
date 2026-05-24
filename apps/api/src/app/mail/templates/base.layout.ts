export function baseLayout(content: string, previewText = ''): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>AfroEventos</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table,td{mso-table-lspace:0;mso-table-rspace:0}
    img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}
    body{margin:0;padding:0;background-color:#0b0d10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif}
    @media only screen and (max-width:600px){
      .email-container{width:100%!important}
      .hero-text{font-size:26px!important;line-height:1.2!important}
      .stack{display:block!important;width:100%!important}
      .pd-mobile{padding:24px 16px!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#0b0d10;">
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;</div>` : ''}
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#0b0d10;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table class="email-container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background-color:#111318;border-radius:16px 16px 0 0;padding:28px 40px;border-bottom:1px solid #1e2229;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <span style="font-size:22px;font-weight:900;letter-spacing:-0.5px;color:#ffffff;">
                      Afro<span style="color:#6AC44D;">Eventos</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CONTENT -->
          ${content}

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#0d0f13;border-radius:0 0 16px 16px;padding:28px 40px;border-top:1px solid #1e2229;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <a href="https://www.facebook.com" style="display:inline-block;margin:0 6px;text-decoration:none;">
                      <span style="display:inline-block;width:36px;height:36px;background:#1e2229;border-radius:50%;line-height:36px;text-align:center;font-size:16px;">f</span>
                    </a>
                    <a href="https://www.instagram.com" style="display:inline-block;margin:0 6px;text-decoration:none;">
                      <span style="display:inline-block;width:36px;height:36px;background:#1e2229;border-radius:50%;line-height:36px;text-align:center;font-size:14px;">ig</span>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="color:#4b5563;font-size:12px;line-height:1.6;">
                    © ${new Date().getFullYear()} AfroEventos · Todos los derechos reservados<br/>
                    <a href="#" style="color:#4b5563;text-decoration:underline;">Políticas de privacidad</a>
                    &nbsp;·&nbsp;
                    <a href="#" style="color:#4b5563;text-decoration:underline;">Términos y condiciones</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:12px;color:#374151;font-size:11px;">
                    Si no solicitaste este correo, puedes ignorarlo con seguridad.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function ctaButton(text: string, url: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
    <tr>
      <td style="border-radius:10px;background-color:#6AC44D;">
        <a href="${url}" target="_blank"
           style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;
                  color:#000000;text-decoration:none;letter-spacing:0.3px;border-radius:10px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>`;
}

export function divider(): string {
  return `<tr><td style="padding:0 40px;"><div style="height:1px;background:#1e2229;"></div></td></tr>`;
}

export function formatDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString('es-EC', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

export function formatTime(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}
