'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
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

  return (
    <section className="banner-slider-section">
      <div className="banner-slider-inner">
        <div className="banner-slider-wrapper">
          <div className="banner-slider-track">
            {banners.map((banner, i) => (
              <div
                key={banner.id}
                className={`banner-slide${i === current ? ' banner-slide--active' : ''}`}
                aria-hidden={i !== current}
              >
                {banner.linkUrl ? (
                  <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="banner-slide-link" tabIndex={i === current ? 0 : -1}>
                    <Image
                      src={resolveUrl(banner.imageUrl)}
                      alt={banner.title || 'Banner publicitario'}
                      className="banner-slide-img"
                      fill
                      quality={90}
                      sizes="(max-width: 1280px) 100vw, 1200px"
                    />
                  </a>
                ) : (
                  <Image
                    src={resolveUrl(banner.imageUrl)}
                    alt={banner.title || 'Banner publicitario'}
                    className="banner-slide-img"
                    fill
                    quality={90}
                    sizes="(max-width: 1280px) 100vw, 1200px"
                  />
                )}
              </div>
            ))}
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
        <span
          aria-label="Contenido publicitario"
          style={{
            position: 'absolute',
            bottom: '0.6rem',
            right: '0.7rem',
            zIndex: 10,
            background: 'rgba(0,0,0,0.55)',
            color: 'rgba(255,255,255,0.85)',
            fontSize: '0.68rem',
            fontWeight: 500,
            letterSpacing: '0.05em',
            padding: '0.22rem 0.6rem',
            borderRadius: '99px',
            pointerEvents: 'none',
            userSelect: 'none',
            border: '1px solid rgba(255,255,255,0.2)',
            lineHeight: '1.2',
          }}
        >
          Publicidad
        </span>
      </div>
    </section>
  );
}
