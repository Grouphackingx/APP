'use client';

import { useState, useTransition } from 'react';
import { EventCard } from './EventCard';
import { getEvents, type EventItem } from '../lib/api';

const ROW_SIZE = 3;

interface Props {
  initialEvents: EventItem[];
  initialTotal: number;
  query?: string;
  limit?: number;
}

export function EventsGrid({ initialEvents, initialTotal, query, limit = 12 }: Props) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [visible, setVisible] = useState(ROW_SIZE);
  const [isPending, startTransition] = useTransition();

  // hasMore = still events to show visually OR more pages on server
  const hasMore = visible < events.length || events.length < total;

  const loadMore = () => {
    if (visible < events.length) {
      // show next row from already-loaded events
      setVisible((prev) => prev + ROW_SIZE);
    } else {
      // fetch next page, then reveal one more row
      const nextPage = page + 1;
      startTransition(async () => {
        try {
          const res = await getEvents(query, nextPage, limit);
          setEvents((prev) => [...prev, ...res.data]);
          setTotal(res.total);
          setPage(nextPage);
          setVisible((prev) => prev + ROW_SIZE);
        } catch {
          // silently ignore
        }
      });
    }
  };

  return (
    <>
      <div className="events-grid">
        {events.slice(0, visible).map((event, i) => (
          <EventCard key={event.id} event={event} index={i} />
        ))}
      </div>

      {hasMore && (
        <div className="show-more-wrapper">
          <button className="show-more-btn" onClick={loadMore} disabled={isPending}>
            {isPending ? 'Cargando...' : <>Mostrar más <span className="show-more-icon">↓</span></>}
          </button>
        </div>
      )}
    </>
  );
}
