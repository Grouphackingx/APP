import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Términos y Condiciones — AfroEventos',
  description: 'Lee los términos y condiciones de uso de la plataforma AfroEventos.',
};

export default function TermsPage() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link href="/" className="legal-back">← Volver al inicio</Link>

        <h1 className="legal-title">Términos y Condiciones</h1>
        <p className="legal-updated">Última actualización: mayo de 2026</p>

        <section className="legal-section">
          <h2>1. Aceptación de los términos</h2>
          <p>
            Al acceder y utilizar AfroEventos — ya sea como comprador de entradas, organizador de eventos o visitante —
            aceptas quedar vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguna parte,
            por favor no utilices nuestra plataforma.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Descripción del servicio</h2>
          <p>
            AfroEventos es una plataforma digital que conecta a organizadores de eventos con compradores de entradas.
            Facilitamos la venta, distribución y validación de tickets digitales con código QR para eventos culturales,
            musicales, deportivos y de entretenimiento.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Registro y cuentas de usuario</h2>
          <ul>
            <li>Debes tener al menos 18 años para registrarte y realizar compras.</li>
            <li>Eres responsable de mantener la confidencialidad de tu contraseña.</li>
            <li>Toda la información que proporciones debe ser verídica y actualizada.</li>
            <li>AfroEventos se reserva el derecho de suspender cuentas que incumplan estos términos.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Compra de entradas</h2>
          <ul>
            <li>Todas las compras son definitivas una vez confirmado el pago, salvo lo indicado en la sección de reembolsos.</li>
            <li>Los precios incluyen los impuestos aplicables según la legislación vigente.</li>
            <li>Recibirás tus entradas digitales (con código QR único) por correo electrónico y en tu perfil de usuario.</li>
            <li>Cada entrada es personal e intransferible. El uso indebido puede resultar en la anulación del ticket sin reembolso.</li>
            <li>AfroEventos no se responsabiliza de entradas adquiridas fuera de la plataforma oficial.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. Política de reembolsos</h2>
          <p>
            Los reembolsos están sujetos a la política de cada organizador. Con carácter general:
          </p>
          <ul>
            <li><strong>Cancelación del evento:</strong> el organizador está obligado a ofrecer reembolso total o alternativa equivalente.</li>
            <li><strong>Cambio de fecha:</strong> el comprador podrá solicitar reembolso dentro de los 5 días hábiles siguientes al anuncio del cambio.</li>
            <li><strong>Desistimiento del comprador:</strong> no se garantiza reembolso una vez procesado el pago, salvo que el organizador lo permita expresamente.</li>
          </ul>
          <p>Para solicitar un reembolso, contacta a <strong>soporte@afroeventos.com</strong>.</p>
        </section>

        <section className="legal-section">
          <h2>6. Obligaciones de los organizadores</h2>
          <p>Los organizadores que utilicen AfroEventos como plataforma de venta se comprometen a:</p>
          <ul>
            <li>Proporcionar información veraz sobre el evento (fecha, lugar, capacidad, precio).</li>
            <li>Celebrar el evento en las condiciones anunciadas o notificar cambios con la mayor antelación posible.</li>
            <li>No superar la capacidad máxima de aforo establecida.</li>
            <li>Cumplir con todas las normativas locales aplicables (permisos, seguridad, salud).</li>
            <li>Abonar a AfroEventos la comisión acordada por cada transacción.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>7. Propiedad intelectual</h2>
          <p>
            Todo el contenido de AfroEventos — logotipos, diseño, código, textos e imágenes propias — es propiedad
            de AfroEventos o sus licenciantes. Queda prohibida su reproducción, distribución o uso comercial sin
            autorización expresa por escrito.
          </p>
          <p>
            El contenido subido por organizadores (imágenes de eventos, descripciones) es responsabilidad exclusiva
            de quien lo publica. AfroEventos se reserva el derecho de eliminar contenido inapropiado.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Limitación de responsabilidad</h2>
          <p>
            AfroEventos actúa como intermediario entre compradores y organizadores. No somos responsables de:
          </p>
          <ul>
            <li>La cancelación, modificación o incumplimiento de las condiciones de un evento por parte del organizador.</li>
            <li>Daños indirectos, lucro cesante o pérdidas consecuentes derivadas del uso de la plataforma.</li>
            <li>Interrupciones del servicio causadas por fuerza mayor o fallos de terceros.</li>
          </ul>
          <p>
            Nuestra responsabilidad máxima frente a cualquier reclamación se limita al importe pagado por la entrada objeto de la disputa.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Conducta del usuario</h2>
          <p>Queda estrictamente prohibido:</p>
          <ul>
            <li>Revender entradas por encima del precio original sin autorización del organizador.</li>
            <li>Falsificar, duplicar o manipular códigos QR de acceso.</li>
            <li>Usar la plataforma para actividades fraudulentas, ilegales o que dañen a terceros.</li>
            <li>Realizar ingeniería inversa o intentar acceder a partes no autorizadas del sistema.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>10. Modificaciones del servicio</h2>
          <p>
            AfroEventos se reserva el derecho de modificar, suspender o discontinuar cualquier parte del servicio
            en cualquier momento, con o sin previo aviso, sin que ello genere responsabilidad frente al usuario.
          </p>
        </section>

        <section className="legal-section">
          <h2>11. Ley aplicable y jurisdicción</h2>
          <p>
            Estos términos se rigen por la legislación vigente en la República de Colombia. Para cualquier controversia,
            las partes se someten a los juzgados y tribunales competentes de Bogotá D.C., renunciando a cualquier otro
            fuero que pudiera corresponderles.
          </p>
        </section>

        <section className="legal-section">
          <h2>12. Contacto</h2>
          <p>
            Para consultas sobre estos términos:<br />
            <strong>legal@afroeventos.com</strong>
          </p>
        </section>
      </div>
    </div>
  );
}
