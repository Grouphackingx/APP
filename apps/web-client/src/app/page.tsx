import { getEvents } from '../lib/api';
import { EventCard } from '../components/EventCard';
import { HeroCarousel } from '../components/HeroCarousel';
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
    events = allEvents.filter((e) => (e as { status?: string }).status === 'PUBLISHED');
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : 'No se pudieron cargar los eventos';
  }

  type AnyEvent = typeof events[number] & {
    date: string;
    squareImageUrl?: string;
    imageUrl?: string;
    bannerImageUrl?: string;
  };

  const toCarouselShape = (e: AnyEvent) => ({
    id: e.id,
    title: e.title,
    squareImageUrl: (e.squareImageUrl ?? null) as string | null,
    imageUrl: (e.imageUrl ?? null) as string | null,
    bannerImageUrl: (e.bannerImageUrl ?? null) as string | null,
  });

  // First 3 upcoming future events for the hero carousel
  const now = new Date();
  const heroEvents = (events as AnyEvent[])
    .filter(e => new Date(e.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)
    .map(toCarouselShape);

  // Fallback: first 3 published if no future events
  const carouselEvents = heroEvents.length > 0
    ? heroEvents
    : (events as AnyEvent[]).slice(0, 3).map(toCarouselShape);

  return (
    <>
      {/* ── Hero Section — only on main page (no search) ── */}
      {!query && (
        <section className="hero-section" aria-label="Bienvenida">
          <div className="hero-split">
            {/* Left — headline + CTA */}
            <div className="hero-split-left">
              <span className="hero-split-eyebrow">Plataforma de Eventos</span>

              <h1 className="hero-split-headline">
                LA CULTURA
                <br />
                QUE NOS
                <span className="accent">MUEVE</span>
              </h1>

              <p className="hero-split-sub">
                Los mejores shows de música afro, salsa y fusión latinoamericana.
                Compra tus entradas en segundos y vive la experiencia.
              </p>

              <div className="hero-split-actions">
                <a href="#eventos" className="hero-split-cta">
                  Explorar Eventos
                </a>
                <Link href="/register" className="hero-split-cta-ghost">
                  Crear Cuenta
                </Link>
              </div>
            </div>

            {/* Right — interactive carousel with next 3 upcoming events */}
            <div className="hero-split-right">
              <HeroCarousel events={carouselEvents} />
            </div>
          </div>
        </section>
      )}

      {/* ── Events Section ── */}
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
                {query ? 'No se encontraron eventos' : 'Aún no hay eventos publicados'}
              </h3>
              <p>
                {query
                  ? `No hay resultados para "${query}". Intenta con otra palabra clave.`
                  : 'Los organizadores están preparando experiencias increíbles. ¡Vuelve pronto!'}
              </p>
              {query && (
                <Link href="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
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
