import { getEvents, getBanners, type EventItem, type BannerItem } from '../lib/api';
import { HeroCarousel } from '../components/HeroCarousel';
import { FeaturedEventsSection } from '../components/FeaturedEventsSection';
import { BannerSlider } from '../components/BannerSlider';
import { EventsGrid } from '../components/EventsGrid';
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
  let banners: BannerItem[] = [];
  let error = '';

  try {
    banners = await getBanners().catch(() => []);
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
                MÚSICA, BAILE
                <br />
                Y CULTURA QUE
                <br />
                TE <span className="accent">PRENDE</span>
              </h1>


              <p className="hero-split-sub">
                Los mejores shows de música afro, salsa y bomba en un solo lugar.
                Accede a los mejores eventos, festivales y fiestas desde una sola plataforma.
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
      {!query && featuredEvents.length > 0 && (
        <div id={generalEvents.length === 0 ? 'eventos' : undefined}>
          {generalEvents.length === 0 && (
            <div className="section-inner upcoming-header-standalone">
              <div className="featured-label">
                <span className="upcoming-icon">🗓</span>
                Próximos Eventos
              </div>
              <p className="featured-sub">Descubre lo que viene y asegura tu lugar</p>
            </div>
          )}
          <FeaturedEventsSection events={featuredEvents} />
        </div>
      )}

      {/* ── Events Section ── */}
      <section className="section" id={generalEvents.length > 0 || !featuredEvents.length ? 'eventos' : undefined}>
        <div className="section-inner">
          {query ? (
            <div className="section-header">
              <h2>{`🔍 Resultados para "${query}"`}</h2>
              <p>Explora los eventos que coinciden con tu búsqueda.</p>
            </div>
          ) : generalEvents.length > 0 ? (
            <div className="featured-header">
              <div className="featured-label">
                <span className="upcoming-icon">🗓</span>
                Próximos Eventos
              </div>
              <p className="featured-sub">Descubre lo que viene y asegura tu lugar</p>
            </div>
          ) : null}

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
            <EventsGrid events={generalEvents} />
          )}
        </div>
      </section>

      {/* ── Banner Slider — only on main page (no search) ── */}
      {!query && banners.length > 0 && <BannerSlider banners={banners} />}
    </>
  );
}
