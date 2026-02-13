import { getEvents } from '../lib/api';
import { EventCard } from '../components/EventCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let events: Awaited<ReturnType<typeof getEvents>> = [];
  let error = '';

  try {
    events = await getEvents();
  } catch (e: any) {
    error = e.message || 'No se pudieron cargar los eventos';
  }

  return (
    <>
      {/* Hero Section */}
      <section className="hero" id="hero-section">
        <div className="hero-inner">
          <div className="hero-badge">🚀 La nueva era de eventos digitales</div>

          <h1>
            Descubre Eventos
            <br />
            <span className="gradient-text">Que Te Inspiran</span>
          </h1>

          <p>
            Encuentra conciertos, festivales y experiencias únicas. Compra tus
            tickets al instante con selección de asientos y entrada digital con
            QR.
          </p>

          <div className="hero-actions">
            <a href="#eventos" className="btn btn-primary btn-lg">
              🎫 Explorar Eventos
            </a>
            <Link href="/register" className="btn btn-secondary btn-lg">
              Crear Cuenta
            </Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="stat-number">{events.length || '0'}</div>
              <div className="stat-label">Eventos Activos</div>
            </div>
            <div className="hero-stat">
              <div className="stat-number">100%</div>
              <div className="stat-label">Digital & Seguro</div>
            </div>
            <div className="hero-stat">
              <div className="stat-number">QR</div>
              <div className="stat-label">Entrada Dinámica</div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="section" id="eventos">
        <div className="section-inner">
          <div className="section-header">
            <h2>🎵 Próximos Eventos</h2>
            <p>
              No te pierdas las mejores experiencias. Asegura tu lugar ahora.
            </p>
          </div>

          {error ? (
            <div className="empty-state">
              <div className="empty-icon">⚠️</div>
              <h3>Error al cargar eventos</h3>
              <p>{error}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎪</div>
              <h3>Aún no hay eventos publicados</h3>
              <p>
                Los organizadores están preparando experiencias increíbles.
                ¡Vuelve pronto!
              </p>
            </div>
          ) : (
            <div className="events-grid">
              {events.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
