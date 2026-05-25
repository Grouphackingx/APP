'use client';

import { useEffect, useRef, useState } from 'react';
import type { BannerItem } from '../lib/api';

interface BannerSliderProps {
  banners: BannerItem[];
}

export function BannerSlider({ banners }: BannerSliderProps) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const SERVER_URL = API_URL.replace('/api', '');

  const resolveUrl = (url: string) =>
    url.startsWith('http') ? url : `${SERVER_URL}${url}`;

  const goTo = (index: number) => {
    setCurrent(index);
    resetTimer();
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (banners.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % banners.length);
      }, 5000);
    }
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[current];

  return (
    <section className="banner-slider-section">
      <div className="banner-slider-inner">
      <div className="banner-slider-wrapper">
        <div className="banner-slider-track">
          {banner.linkUrl ? (
            <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="banner-slide-link">
              <img
                src={resolveUrl(banner.imageUrl)}
                alt={banner.title || 'Banner publicitario'}
                className="banner-slide-img"
              />
            </a>
          ) : (
            <img
              src={resolveUrl(banner.imageUrl)}
              alt={banner.title || 'Banner publicitario'}
              className="banner-slide-img"
            />
          )}
        </div>

        {banners.length > 1 && (
          <>
            <button
              className="banner-nav banner-nav-prev"
              onClick={() => goTo((current - 1 + banners.length) % banners.length)}
              aria-label="Banner anterior"
            >
              ‹
            </button>
            <button
              className="banner-nav banner-nav-next"
              onClick={() => goTo((current + 1) % banners.length)}
              aria-label="Siguiente banner"
            >
              ›
            </button>
            <div className="banner-dots">
              {banners.map((_, i) => (
                <button
                  key={i}
                  className={`banner-dot${i === current ? ' active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Ir al banner ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      </div>
    </section>
  );
}
