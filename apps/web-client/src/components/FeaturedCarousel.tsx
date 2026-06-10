'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { EventItem } from '../lib/api';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-EC', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}
function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('es-EC', {
    hour: '2-digit', minute: '2-digit',
  });
}

const VISIBLE = 3;

export function FeaturedCarousel({ events }: { events: EventItem[] }) {
  const len = events.length;
  const [index, setIndex] = useState(0);
  const [animated, setAnimated] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [paused, setPaused] = useState(false);

  // Clonamos primeros y últimos VISIBLE para el efecto infinito
  const cloned = [
    ...events.slice(-VISIBLE),
    ...events,
    ...events.slice(0, VISIBLE),
  ];
  // El índice real dentro de cloned empieza en VISIBLE
  const trackIndex = index + VISIBLE;
  // translateX es % del propio track, cada tarjeta ocupa 100/cloned.length % del track
  const cardPct = 100 / cloned.length;

  const goTo = (newIndex: number, animate = true) => {
    setAnimated(animate);
    setIndex(newIndex);
  };

  const next = () => goTo((index + 1) % len);
  const prev = () => goTo((index - 1 + len) % len);

  // Cuando llega a los clones, salta sin animación al original
  const handleTransitionEnd = () => {
    if (index < 0) {
      goTo(len - 1, false);
    } else if (index >= len) {
      goTo(0, false);
    }
  };

  // Auto-avance
  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (paused || len <= VISIBLE) return;
    timerRef.current = setInterval(() => setIndex(i => (i + 1) % len), 4500);
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, len]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="fcarousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Track deslizante */}
      <div className="fcarousel-viewport">
        <div
          className="fcarousel-track"
          style={{
            transform: `translateX(-${trackIndex * cardPct}%)`,
            transition: animated ? 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none',
            width: `${(cloned.length / VISIBLE) * 100}%`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {cloned.map((event, i) => {
            const img = event.squareImageUrl || event.imageUrl || event.bannerImageUrl;
            return (
              <div
                key={`${event.id}-${i}`}
                className="fcarousel-card-wrap"
                style={{ width: `${100 / cloned.length}%` }}
              >
                <Link
                  href={`/eventos/${event.slug || event.id}`}
                  className="fcarousel-card"
                >
                  <div className="fcarousel-img">
                    {img
                      ? <Image src={img} alt={event.title} fill quality={90} sizes="(max-width: 768px) 90vw, 400px" />
                      : <div className="fcarousel-no-img">🎵</div>
                    }
                    <span className="featured-badge">★ Destacado</span>
                  </div>
                  <div className="fcarousel-body">
                    <h3 className="fcarousel-title">{event.title}</h3>
                    <div className="fcarousel-meta">
                      <span>📅 {formatDate(event.date)}</span>
                      <span>⏰ {formatTime(event.date)}</span>
                      <span>📍 {event.location}{event.city ? `, ${event.city}` : ''}</span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flechas */}
      <button className="fcarousel-arrow fcarousel-arrow-prev" onClick={prev} aria-label="Anterior">‹</button>
      <button className="fcarousel-arrow fcarousel-arrow-next" onClick={next} aria-label="Siguiente">›</button>

      {/* Dots */}
      <div className="fcarousel-dots">
        {events.map((_, i) => (
          <button
            key={i}
            className={`fcarousel-dot${i === index ? ' active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Evento ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
