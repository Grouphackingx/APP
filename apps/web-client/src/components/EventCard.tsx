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

function getMinPrice(zones: EventItem['zones']): string {
  if (!zones || zones.length === 0) return '—';
  const prices = zones.map((z) => Number(z.price));
  const min = Math.min(...prices);
  return `$${min.toFixed(2)}`;
}

export function EventCard({
  event,
  index,
}: {
  event: EventItem;
  index: number;
}) {
  return (
    <Link
      href={`/events/${event.id}`}
      className={`event-card animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
      id={`event-card-${event.id}`}
    >
      <div className="event-card-image">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} />
        ) : (
          <span className="placeholder-icon">🎶</span>
        )}
        <div className="event-card-badge">
          {event.status === 'PUBLISHED'
            ? '🔥 En Venta'
            : event.status === 'DRAFT'
              ? '📝 Borrador'
              : event.status}
        </div>
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
          </span>
        </div>
        <div className="event-card-footer">
          <div className="event-card-price">
            {getMinPrice(event.zones)} <span>desde</span>
          </div>
          <span className="btn btn-accent btn-sm">Ver Detalles</span>
        </div>
      </div>
    </Link>
  );
}
