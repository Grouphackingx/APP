'use client';

import { useState } from 'react';
import { EventCard } from './EventCard';
import type { EventItem } from '../lib/api';

const PAGE_SIZE = 3;

export function EventsGrid({ events }: { events: EventItem[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  const showMore = () => setVisible((prev) => prev + PAGE_SIZE);
  const hasMore = visible < events.length;

  return (
    <>
      <div className="events-grid">
        {events.slice(0, visible).map((event, i) => (
          <EventCard key={event.id} event={event} index={i} />
        ))}
      </div>

      {hasMore && (
        <div className="show-more-wrapper">
          <button className="show-more-btn" onClick={showMore}>
            Mostrar más <span className="show-more-icon">↓</span>
          </button>
        </div>
      )}
    </>
  );
}
