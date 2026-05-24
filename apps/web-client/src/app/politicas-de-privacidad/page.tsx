import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Políticas de Privacidad — AfroEventos',
  description: 'Conoce cómo AfroEventos recopila, usa y protege tu información personal.',
};

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link href="/" className="legal-back">← Volver al inicio</Link>

        <h1 className="legal-title">Políticas de Privacidad</h1>
        <p className="legal-updated">Última actualización: mayo de 2026</p>

        <section className="legal-section">
          <h2>1. Información que recopilamos</h2>
          <p>
            En AfroEventos recopilamos información que tú nos proporcionas directamente al crear una cuenta,
            comprar entradas o interactuar con nuestra plataforma. Esto incluye:
          </p>
          <ul>
            <li><strong>Datos de registro:</strong> nombre completo, correo electrónico, número de teléfono y contraseña cifrada.</li>
            <li><strong>Datos de pago:</strong> procesamos tus pagos a través de proveedores seguros (Stripe). AfroEventos no almacena números de tarjeta completos.</li>
            <li><strong>Datos de uso:</strong> páginas visitadas, eventos consultados y tickets adquiridos, con el fin de mejorar la experiencia.</li>
            <li><strong>Datos del dispositivo:</strong> dirección IP, tipo de navegador y sistema operativo, de forma anónima.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>2. Uso de la información</h2>
          <p>Utilizamos tus datos para:</p>
          <ul>
            <li>Gestionar tu cuenta y procesar tus compras de entradas.</li>
            <li>Enviarte confirmaciones de compra y códigos QR de acceso.</li>
            <li>Notificarte sobre cambios en eventos que hayas adquirido.</li>
            <li>Mejorar nuestros servicios y personalizar tu experiencia.</li>
            <li>Cumplir con obligaciones legales y prevenir fraudes.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Compartición de datos</h2>
          <p>
            AfroEventos no vende ni alquila tu información personal a terceros. Podemos compartir datos únicamente con:
          </p>
          <ul>
            <li><strong>Organizadores de eventos:</strong> nombre y correo del comprador, exclusivamente para gestión de asistencia.</li>
            <li><strong>Proveedores de pago:</strong> Stripe u otros procesadores certificados PCI-DSS.</li>
            <li><strong>Autoridades competentes:</strong> cuando exista obligación legal debidamente fundamentada.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Seguridad de los datos</h2>
          <p>
            Implementamos medidas técnicas y organizativas para proteger tu información: cifrado HTTPS en todas
            las comunicaciones, contraseñas almacenadas con hash bcrypt, tokens JWT de corta duración y acceso
            restringido a bases de datos de producción.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Cookies y tecnologías similares</h2>
          <p>
            Utilizamos cookies de sesión estrictamente necesarias para mantener tu inicio de sesión. No utilizamos
            cookies de rastreo publicitario de terceros. Puedes configurar tu navegador para bloquear cookies,
            aunque esto puede afectar algunas funciones de la plataforma.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Tus derechos</h2>
          <p>Como usuario tienes derecho a:</p>
          <ul>
            <li><strong>Acceder</strong> a los datos personales que tenemos sobre ti.</li>
            <li><strong>Rectificar</strong> información incorrecta o desactualizada.</li>
            <li><strong>Eliminar</strong> tu cuenta y los datos asociados, salvo que exista obligación legal de conservarlos.</li>
            <li><strong>Portabilidad:</strong> solicitar una copia de tus datos en formato legible.</li>
          </ul>
          <p>Para ejercer cualquiera de estos derechos, escríbenos a <strong>privacidad@afroeventos.com</strong>.</p>
        </section>

        <section className="legal-section">
          <h2>7. Retención de datos</h2>
          <p>
            Conservamos tus datos mientras tu cuenta esté activa o sea necesario para prestarte el servicio.
            Los registros de transacciones se mantienen por el período exigido por la legislación fiscal aplicable
            (generalmente 5 años).
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Cambios en esta política</h2>
          <p>
            Podemos actualizar estas políticas ocasionalmente. Te notificaremos por correo electrónico ante cambios
            significativos. El uso continuado de la plataforma tras la notificación implica aceptación de la nueva versión.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Contacto</h2>
          <p>
            Si tienes preguntas sobre esta política, puedes contactarnos en:<br />
            <strong>privacidad@afroeventos.com</strong>
          </p>
        </section>
      </div>
    </div>
  );
}
