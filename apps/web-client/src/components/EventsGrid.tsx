'use client';

import { useState } from 'react';
import { EventCard } from './EventCard';
import { getEvents, type EventItem } from '../lib/api';

const ROW_SIZE = 3;

interface Props {
  initialEvents: EventItem[];
  initialTotal: number;
  query?: string;
  limit?: number;
  excludeIds?: string[];
}

export function EventsGrid({ initialEvents, initialTotal, query, limit = 12, excludeIds = [] }: Props) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [visible, setVisible] = useState(ROW_SIZE);
  const [loading, setLoading] = useState(false);

  const excludeSet = new Set(excludeIds);
  const hasMore = visible < events.length || events.length < total;

  const loadMore = async () => {
    if (loading) return;

    if (visible < events.length) {
      setVisible((prev) => prev + ROW_SIZE);
      return;
    }

    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await getEvents(query, nextPage, limit);
      // Filter out featured events that are already shown above the grid
      const fresh = res.data.filter((e) => !excludeSet.has(e.id));
      setEvents((prev) => [...prev, ...fresh]);
      setTotal(res.total);
      setPage(nextPage);
      setVisible((prev) => prev + ROW_SIZE);
    } catch {
      // silently ignore network errors
    } finally {
      setLoading(false);
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
          <button className="show-more-btn" onClick={loadMore} disabled={loading}>
            {loading ? 'Cargando...' : <>Mostrar más <span className="show-more-icon">↓</span></>}
          </button>
        </div>
      )}
    </>
  );
}
