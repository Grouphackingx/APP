import Link from 'next/link';
import Image from 'next/image';
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
    // Detail data: full seats array present
    if (zone.seats && zone.seats.length > 0) return zone.seats.every(seat => seat.isSold);
    // Listing data: aggregate count (zone is sold out when all seats are sold)
    if (zone.capacity > 0) return (zone.soldCount ?? 0) >= zone.capacity;
    // sellOnSite or zones without seats are never "sold out"
    return false;
  });
}

export function EventCard({
  event,
  index,
}: {
  event: EventItem;
  index: number;
}) {
  const soldOut = isEventSoldOut(event);

  return (
    <Link
      href={`/eventos/${event.slug || event.id}`}
      className={`event-card animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
      id={`event-card-${event.id}`}
    >
      <div className="event-card-image">
        <Image
          src={event.squareImageUrl || event.imageUrl || '/default-portrait.svg'}
          alt={event.title}
          fill
          quality={90}
          sizes="(max-width: 700px) 90vw, (max-width: 1024px) 45vw, 380px"
        />
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
      </div>
    </Link>
  );
}
