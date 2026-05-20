import { getEvents, type EventItem } from '../lib/api';
import { EventCard } from '../components/EventCard';
import { HeroCarousel } from '../components/HeroCarousel';
import { FeaturedEventsSection } from '../components/FeaturedEventsSection';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type CarouselEvent = {
  id: string;
  title: string;
  portraitImageUrl: string | null;
  squareImageUrl: string | null;
  imageUrl: string | null;
  bannerImageUrl: string | null;
};

export default async function HomePage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q;

  let featuredEvents: EventItem[] = [];
  let generalEvents: EventItem[] = [];
  let error = '';

  try {
    const allEvents = await getEvents(query);
    const published = allEvents.filter((e) => e.status === 'PUBLISHED');

    const now = new Date();

    featuredEvents = published.filter(
      (e) =>
        e.isFeatured &&
        (!e.featuredUntil || new Date(e.featuredUntil) > now)
    );

    const featuredIds = new Set(featuredEvents.map((e) => e.id));
    generalEvents = published.filter((e) => !featuredIds.has(e.id));
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : 'No se pudieron cargar los eventos';
  }

  const toCarouselShape = (e: EventItem): CarouselEvent => ({
    id: e.id,
    title: e.title,
    portraitImageUrl: e.portraitImageUrl ?? null,
    squareImageUrl: e.squareImageUrl ?? null,
    imageUrl: e.imageUrl ?? null,
    bannerImageUrl: e.bannerImageUrl ?? null,
  });

  const allPublished = [...featuredEvents, ...generalEvents];
  const now = new Date();
  const heroEvents = allPublished
    .filter((e) => new Date(e.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)
    .map(toCarouselShape);

  const carouselEvents: CarouselEvent[] =
    heroEvents.length > 0 ? heroEvents : allPublished.slice(0, 3).map(toCarouselShape);

  return (
    <>
      {/* ── Hero Section — only on main page (no search) ── */}
      {!query && (
        <section className="hero-section" aria-label="Bienvenida">
          <div className="hero-split">
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

            <div className="hero-split-right">
              <HeroCarousel events={carouselEvents} />
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Events — only on main page (no search), only if there are featured events ── */}
      {!query && <FeaturedEventsSection events={featuredEvents} />}

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
          ) : generalEvents.length === 0 && featuredEvents.length === 0 ? (
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
          ) : generalEvents.length === 0 ? null : (
            <div className="events-grid">
              {generalEvents.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
