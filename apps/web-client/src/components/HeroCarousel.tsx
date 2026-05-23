'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface CarouselEvent {
  id: string;
  slug?: string | null;
  title: string;
  portraitImageUrl?: string | null;
  squareImageUrl?: string | null;
  imageUrl?: string | null;
  bannerImageUrl?: string | null;
}

export function HeroCarousel({ events }: { events: CarouselEvent[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // teleport: card that must instantly jump off-screen before animating to new slot
  const [teleport, setTeleport] = useState<{ idx: number; side: 'left' | 'right' } | null>(null);

  const activeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // always-fresh navigate reference so the interval closure never goes stale
  const navigateRef = useRef<(newIdx: number, dir: 'next' | 'prev') => void>(null!);
  const len = events.length;

  // Core transition: instantly place the "wrap-around" card off-screen,
  // then on the next paint slide everything into new positions.
  const navigate = (newIdx: number, dir: 'next' | 'prev') => {
    if (newIdx === activeRef.current) return;

    if (len >= 3) {
      // Going next → the prev card (left) wraps to right side
      // Going prev → the next card (right) wraps to left side
      const teleportIdx =
        dir === 'next'
          ? (activeRef.current - 1 + len) % len
          : (activeRef.current + 1) % len;

      setTeleport({ idx: teleportIdx, side: dir === 'next' ? 'right' : 'left' });

      // 2 rAFs: first ensures the class is painted (no transition),
      // second triggers the animated transition to the new slot.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setTeleport(null);
          activeRef.current = newIdx;
          setActive(newIdx);
        })
      );
    } else {
      activeRef.current = newIdx;
      setActive(newIdx);
    }
  };
  navigateRef.current = navigate;

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (len <= 1) return;
    timerRef.current = setInterval(() => {
      const next = (activeRef.current + 1) % len;
      navigateRef.current(next, 'next');
    }, 4500);
  };

  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, len]); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = (idx: number) => {
    const curr = activeRef.current;
    if (idx === curr) return;
    const nextDist = (idx - curr + len) % len;
    const dir: 'next' | 'prev' = nextDist <= len - nextDist ? 'next' : 'prev';
    navigate(idx, dir);
    resetTimer();
  };

  if (len === 0) {
    return (
      <div className="hero-no-event">
        <div className="hero-no-event-icon">🎵</div>
        <p>Próximamente nuevos eventos</p>
      </div>
    );
  }

  const slotClass = (idx: number): string => {
    // Teleporting card: placed instantly off-screen (no CSS transition)
    if (teleport?.idx === idx) return `hcc-enter-${teleport.side}`;
    if (idx === active) return 'hcc-active';
    if (len >= 3) {
      if (idx === (active - 1 + len) % len) return 'hcc-prev';
      if (idx === (active + 1) % len) return 'hcc-next';
    } else if (len === 2 && idx !== active) {
      return 'hcc-next';
    }
    return 'hcc-hidden';
  };

  return (
    <div
      className="hero-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-carousel-stage">
        {events.map((event, i) => {
          const sc = slotClass(i);
          const isActive = sc === 'hcc-active';
          const img = event.portraitImageUrl || event.squareImageUrl || event.imageUrl || event.bannerImageUrl;
          return (
            <div
              key={event.id}
              className={`hero-carousel-card ${sc}`}
              onClick={() => !isActive && goTo(i)}
              aria-hidden={!isActive}
            >
              <Link
                href={`/events/${event.slug || event.id}`}
                onClick={e => !isActive && e.preventDefault()}
                tabIndex={isActive ? 0 : -1}
                className="hcc-link"
              >
                {img ? (
                  <img src={img} alt={event.title} className="hcc-img" draggable={false} />
                ) : (
                  <div className="hcc-placeholder">
                    <span>🎵</span>
                    <p>{event.title}</p>
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {len > 1 && (
        <div className="hero-carousel-dots">
          {events.map((_, i) => (
            <button
              key={i}
              className={`hcc-dot${i === active ? ' active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Evento ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
