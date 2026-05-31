import Link from 'next/link';
import type { EventItem } from '../lib/api';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-EC', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
}

function isEventSoldOut(event: EventItem): boolean {
  if (!event.zones || event.zones.length === 0) return false;
  return event.zones.every(zone => {
    if (!zone.seats || zone.seats.length === 0) return false;
    return zone.seats.every(seat => seat.isSold);
  });
}

function getMinPrice(event: EventItem): number | null {
  if (!event.zones || event.zones.length === 0) return null;
  const prices = event.zones.map(z => Number(z.price)).filter(p => !isNaN(p));
  if (prices.length === 0) return null;
  return Math.min(...prices);
}

export function EventCard({
  event,
  index,
}: {
  event: EventItem;
  index: number;
}) {
  const soldOut = isEventSoldOut(event);
  const minPrice = getMinPrice(event);

  return (
    <Link
      href={`/eventos/${event.slug || event.id}`}
      className={`event-card animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
      id={`event-card-${event.id}`}
    >
      <div className="event-card-image">
        <img src={event.squareImageUrl || event.imageUrl || '/default-portrait.svg'} alt={event.title} />
        {event.category && (
          <div className="event-card-badge event-card-badge--category">
            {event.category}
          </div>
        )}
        {soldOut && (
          <div className="event-card-badge event-card-badge--sold-out">
            🚫 Agotado
          </div>
        )}
      </div>
      <div className="event-card-body">
        <h3>{event.title}</h3>
        <div className="event-card-meta">
          <span>
            <span className="meta-icon">📅</span>
            {formatDate(event.date)}
          </span>
          <span>
            <span className="meta-icon">⏰</span>
            {formatTime(event.date)}
          </span>
          <span>
            <span className="meta-icon">📍</span>
            {event.location}
            {event.city ? `, ${event.city}` : ''}
          </span>
        </div>
        {minPrice !== null && (
          <div className="event-card-footer">
            <div className="event-card-price">
              {minPrice === 0 ? 'Gratis' : `$${minPrice.toFixed(2)}`}
              {minPrice > 0 && <span>desde</span>}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
