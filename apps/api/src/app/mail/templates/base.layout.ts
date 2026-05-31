export function baseLayout(content: string, previewText = ''): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no"/>
  <title>AfroEventos</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body width="100%" style="margin:0;padding:0;background-color:#0b0d10;mso-line-height-rule:exactly;">
  <!-- Estilos en body para compatibilidad con Gmail (elimina estilos del head) -->
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}
    img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none}
    a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
    #MessageViewBody a{color:inherit;text-decoration:none;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit}
    u+#body a{color:inherit;text-decoration:none;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit}
    @media only screen and (max-width:600px){
      .email-container{width:100%!important}
      .pd-mobile{padding:24px 20px!important}
      .hero-text{font-size:24px!important;line-height:1.2!important}
      .hide-mobile{display:none!important;max-height:0!important;overflow:hidden!important;mso-hide:all!important}
    }
  </style>
  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#0b0d10"><tr><td><![endif]-->

  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#0b0d10;">${previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#0b0d10" style="background-color:#0b0d10;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table class="email-container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td align="center" bgcolor="#111318" style="background-color:#111318;border-radius:16px 16px 0 0;padding:28px 40px;border-bottom:2px solid #1e2229;">
              <a href="https://afroeventos.com" target="_blank" style="text-decoration:none;display:inline-block;">
                <img src="https://afroeventos.com/logo-blanco.svg"
                     alt="AfroEventos"
                     width="160" height="57"
                     style="display:block;border:0;outline:none;text-decoration:none;height:57px;width:160px;"
                />
              </a>
            </td>
          </tr>

          <!-- CONTENT -->
          ${content}

          <!-- FOOTER -->
          <tr>
            <td align="center" bgcolor="#0d0f13" style="background-color:#0d0f13;border-radius:0 0 16px 16px;padding:32px 40px;border-top:1px solid #1e2229;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">

                <!-- Links legales -->
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <a href="https://afroeventos.com/politicas-de-privacidad" target="_blank" style="color:#6b7280;font-family:Arial,sans-serif;font-size:12px;text-decoration:underline;">Políticas de privacidad</a>
                    <span style="color:#374151;font-family:Arial,sans-serif;font-size:12px;">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
                    <a href="https://afroeventos.com/terminos-y-condiciones" target="_blank" style="color:#6b7280;font-family:Arial,sans-serif;font-size:12px;text-decoration:underline;">Términos y condiciones</a>
                    <span style="color:#374151;font-family:Arial,sans-serif;font-size:12px;">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
                    <a href="https://afroeventos.com" target="_blank" style="color:#6b7280;font-family:Arial,sans-serif;font-size:12px;text-decoration:underline;">Visitar sitio</a>
                  </td>
                </tr>

                <!-- Copyright -->
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <span style="color:#4b5563;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;">
                      &copy; ${year} AfroEventos &middot; Todos los derechos reservados<br/>
                      Ecuador
                    </span>
                  </td>
                </tr>

                <!-- Nota de seguridad -->
                <tr>
                  <td align="center">
                    <span style="color:#374151;font-family:Arial,sans-serif;font-size:11px;line-height:1.5;">
                      Recibiste este correo porque tienes una cuenta en AfroEventos.<br/>
                      Si no reconoces esta actividad, por favor cont&aacute;ctanos en
                      <a href="mailto:soporte@afroeventos.com" style="color:#374151;text-decoration:underline;">soporte@afroeventos.com</a>
                    </span>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

  <!--[if mso | IE]></td></tr></table><![endif]-->
</body>
</html>`;
}

export function iconCircle(emoji: string, bgColor: string, borderColor: string, size = 72): string {
  const radius = Math.round(size / 2);
  const fontSize = Math.round(size * 0.46);
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 24px auto;">
    <tr>
      <td width="${size}" height="${size}" align="center" valign="middle" bgcolor="${bgColor}"
          style="background-color:${bgColor};border-radius:${radius}px;border:2px solid ${borderColor};
                 font-size:${fontSize}px;text-align:center;vertical-align:middle;line-height:${size}px;
                 font-family:Arial,sans-serif;">
        ${emoji}
      </td>
    </tr>
  </table>`;
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
