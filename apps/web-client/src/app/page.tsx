import { getEvents } from '../lib/api';
import { EventCard } from '../components/EventCard';

import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HomePage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q;

  let events: Awaited<ReturnType<typeof getEvents>> = [];
  let error = '';

  try {
    const allEvents = await getEvents(query);
    events = allEvents.filter((e: any) => e.status === 'PUBLISHED');
  } catch (e: any) {
    error = e.message || 'No se pudieron cargar los eventos';
  }

  return (
    <>

      {/* Events Section */}
      <section className="section" id="eventos">
        <div className="section-inner">
          <div className="section-header">
            <h2>
              {query ? `🔍 Resultados para "${query}"` : '🎵 Próximos Eventos'}
            </h2>
            <p>
              {query
                ? 'Explora los eventos que coinciden con tu búsqueda.'
                : 'No te pierdas las mejores experiencias. Asegura tu lugar ahora.'}
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
              <div className="empty-icon">{query ? '🔍' : '🎪'}</div>
              <h3>
                {query
                  ? 'No se encontraron eventos'
                  : 'Aún no hay eventos publicados'}
              </h3>
              <p>
                {query
                  ? `No hay resultados para "${query}". Intenta con otra palabra clave.`
                  : 'Los organizadores están preparando experiencias increíbles. ¡Vuelve pronto!'}
              </p>
              {query && (
                <Link
                  href="/"
                  className="btn btn-secondary"
                  style={{ marginTop: '1rem' }}
                >
                  Ver Todos los Eventos
                </Link>
              )}
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
