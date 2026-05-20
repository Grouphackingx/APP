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
        <img src={event.squareImageUrl || event.imageUrl || '/default-portrait.svg'} alt={event.title} />
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
            {event.city ? `, ${event.city}` : ''}
          </span>
        </div>
      </div>
    </Link>
  );
}
