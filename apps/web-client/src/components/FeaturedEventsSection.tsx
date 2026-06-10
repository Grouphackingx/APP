'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { EventItem } from '../lib/api';
import { FeaturedCarousel } from './FeaturedCarousel';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
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

        {/* ── 1 evento: tarjeta horizontal full-width ── */}
        {events.length === 1 && (
          <div className="featured-panoramic-grid">
            {events.map((event) => {
              const img = event.bannerImageUrl || event.squareImageUrl || event.imageUrl;
              return (
                <Link
                  key={event.id}
                  href={`/eventos/${event.slug || event.id}`}
                  className="featured-card-h"
                >
                  <div className="featured-card-h-img">
                    {img
                      ? <img src={img} alt={event.title} loading="lazy" decoding="async" />
                      : <div className="featured-card-no-img">🎵</div>
                    }
                    <span className="featured-badge">★ Destacado</span>
                  </div>
                  <div className="featured-card-h-body">
                    <h3 className="featured-card-h-title">{event.title}</h3>
                    <div className="featured-card-h-meta">
                      <span>📅 {formatDate(event.date)}</span>
                      <span>⏰ {formatTime(event.date)}</span>
                      <span>📍 {event.location}{event.city ? `, ${event.city}` : ''}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── 2 eventos: dos columnas, imagen panorámica arriba + info abajo ── */}
        {events.length === 2 && (
          <div className="featured-two-grid">
            {events.map((event) => {
              const img = event.bannerImageUrl || event.squareImageUrl || event.imageUrl;
              return (
                <Link
                  key={event.id}
                  href={`/eventos/${event.slug || event.id}`}
                  className="featured-card-v"
                >
                  <div className="featured-card-v-img">
                    {img
                      ? <Image src={img} alt={event.title} fill sizes="(max-width: 768px) 100vw, 600px" />
                      : <div className="featured-card-no-img">🎵</div>
                    }
                    <span className="featured-badge">★ Destacado</span>
                  </div>
                  <div className="featured-card-v-body">
                    <h3 className="featured-card-h-title">{event.title}</h3>
                    <div className="featured-card-h-meta">
                      <span>📅 {formatDate(event.date)}</span>
                      <span>⏰ {formatTime(event.date)}</span>
                      <span>📍 {event.location}{event.city ? `, ${event.city}` : ''}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── 3+ eventos: carrusel horizontal ── */}
        {events.length >= 3 && (
          <FeaturedCarousel events={events} />
        )}

      </div>
    </section>
  );
}
