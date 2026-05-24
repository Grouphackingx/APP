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
        <img src={event.squareImageUrl || event.imageUrl || '/default-portrait.svg'} alt={event.title} />
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
