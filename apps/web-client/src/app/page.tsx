import { getEvents, getBanners, getEventCategories, type EventItem, type BannerItem } from '../lib/api';
import { HeroCarousel } from '../components/HeroCarousel';
import { FeaturedEventsSection } from '../components/FeaturedEventsSection';
import { BannerSlider } from '../components/BannerSlider';
import { OrganizerCTA } from '../components/OrganizerCTA';
import { EventsGrid } from '../components/EventsGrid';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type CarouselEvent = {
  id: string;
  slug?: string | null;
  title: string;
  portraitImageUrl: string | null;
  squareImageUrl: string | null;
  imageUrl: string | null;
  bannerImageUrl: string | null;
};

export default async function HomePage(props: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q;
  const category = searchParams.category;

  let featuredEvents: EventItem[] = [];
  let generalEvents: EventItem[] = [];
  let banners: BannerItem[] = [];
  let availableCategories: string[] = [];
  let error = '';

  let generalTotal = 0;

  // Hero always shows the 3 nearest upcoming events regardless of category filter
  let heroSourceEvents: EventItem[] = [];

  try {
    [banners, availableCategories] = await Promise.all([
      getBanners().catch(() => []),
      getEventCategories().catch(() => []),
    ]);

    const [result, heroResult] = await Promise.all([
      getEvents(query, 1, 12, category),
      // Hero fetch: unfiltered by category, enough to find 3 upcoming
      category ? getEvents(query, 1, 12) : Promise.resolve(null),
    ]);

    heroSourceEvents = (heroResult ?? result).data;

    const now = new Date();

    featuredEvents = result.data.filter(
      (e) =>
        e.isFeatured &&
        (!e.featuredUntil || new Date(e.featuredUntil) > now)
    );

    const featuredIds = new Set(featuredEvents.map((e) => e.id));
    generalEvents = result.data.filter((e) => !featuredIds.has(e.id));
    // If the API returned fewer items than the limit, we have ALL events already —
    // use the exact count. Otherwise estimate from total minus known featured count.
    const LIMIT = 12;
    generalTotal = result.data.length < LIMIT
      ? generalEvents.length
      : Math.max(generalEvents.length, result.total - featuredEvents.length);
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : 'No se pudieron cargar los eventos';
  }

  const toCarouselShape = (e: EventItem): CarouselEvent => ({
    id: e.id,
    slug: e.slug ?? null,
    title: e.title,
    portraitImageUrl: e.portraitImageUrl ?? null,
    squareImageUrl: e.squareImageUrl ?? null,
    imageUrl: e.imageUrl ?? null,
    bannerImageUrl: e.bannerImageUrl ?? null,
  });

  const now = new Date();
  const heroUpcoming = heroSourceEvents
    .filter((e) => new Date(e.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)
    .map(toCarouselShape);

  const carouselEvents: CarouselEvent[] =
    heroUpcoming.length > 0 ? heroUpcoming : heroSourceEvents.slice(0, 3).map(toCarouselShape);

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

          {/* ── Category pills — only show if there are multiple categories ── */}
          {!query && availableCategories.length > 1 && (
            <div className="category-pills">
              <Link
                href="/"
                className={`category-pill${!category ? ' category-pill--active' : ''}`}
              >
                Todos
              </Link>
              {availableCategories.map((cat) => (
                <Link
                  key={cat}
                  href={`/?category=${encodeURIComponent(cat)}`}
                  className={`category-pill${category === cat ? ' category-pill--active' : ''}`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          )}

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
            <EventsGrid
              initialEvents={generalEvents}
              initialTotal={generalTotal}
              query={query}
              category={category}
              limit={12}
              excludeIds={[...new Set(featuredEvents.map((e) => e.id))]}
            />
          )}
        </div>
      </section>

      {/* ── Banner Slider — only on main page (no search) ── */}
      {!query && banners.length > 0 && <BannerSlider banners={banners} />}

      {/* ── Organizer CTA — only on main page (no search) ── */}
      {!query && <OrganizerCTA />}
    </>
  );
}
