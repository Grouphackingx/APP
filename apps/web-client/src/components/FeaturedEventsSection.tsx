import Link from 'next/link';
import type { EventItem } from '../lib/api';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-EC', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function FeaturedEventsSection({ events }: { events: EventItem[] }) {
  if (events.length === 0) return null;

  return (
    <section className="featured-section" aria-label="Eventos Destacados">
      <div className="section-inner">
        <div className="featured-header">
          <div className="featured-label">
            <span className="featured-star">★</span>
            Destacados
          </div>
          <p className="featured-sub">Experiencias seleccionadas que no te puedes perder</p>
        </div>

        <div className="featured-grid">
          {events.map((event) => {
            const img = event.squareImageUrl || event.imageUrl || event.bannerImageUrl;
            return (
              <Link key={event.id} href={`/eventos/${event.slug || event.id}`} className="featured-card">
                <div className="featured-card-img">
                  {img ? (
                    <img src={img} alt={event.title} />
                  ) : (
                    <div className="featured-card-no-img">🎵</div>
                  )}
                    <span className="featured-badge">★ Destacado</span>
                </div>
                <div className="featured-card-body">
                  <h3 className="featured-card-title">{event.title}</h3>
                  <div className="featured-card-meta">
                    <span>📅 {formatDate(event.date)}</span>
                    <span>⏰ {formatTime(event.date)}</span>
                    <span>📍 {event.location}{event.city ? `, ${event.city}` : ''}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
