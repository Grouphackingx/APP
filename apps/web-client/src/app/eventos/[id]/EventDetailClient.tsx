'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { EventItem, Seat, PurchaseResponse } from '../../../lib/api';
import { lockSeats, purchaseTickets } from '../../../lib/api';
import { useAuth } from '../../../lib/AuthContext';

function EventGallery({ urls }: { urls: string[] }) {
  const [active, setActive] = useState(0);

  // Una sola imagen: mostrar completa sin controles
  if (urls.length === 1) {
    return (
      <div className="evg-section">
        <h3 className="evg-title">Galería</h3>
        <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <img src={urls[0]} alt="Galería" style={{ width: '100%', height: 'auto', display: 'block' }} loading="lazy" decoding="async" />
        </div>
      </div>
    );
  }

  // 2+ imágenes: galería con imagen principal + thumbnails
  return (
    <div className="evg-section">
      <h3 className="evg-title">Galería</h3>

      <div className="evg-main">
        <img key={active} src={urls[active]} alt={`Galería ${active + 1}`} className="evg-main-img" loading="lazy" decoding="async" />
        <button className="evg-arrow evg-arrow--prev" onClick={() => setActive(i => (i - 1 + urls.length) % urls.length)} aria-label="Anterior">‹</button>
        <button className="evg-arrow evg-arrow--next" onClick={() => setActive(i => (i + 1) % urls.length)} aria-label="Siguiente">›</button>
        <div className="evg-counter">{active + 1} / {urls.length}</div>
      </div>

      <div className="evg-thumbs">
        {urls.map((url, i) => (
          <button key={i} className={`evg-thumb${i === active ? ' evg-thumb--active' : ''}`} onClick={() => setActive(i)} aria-label={`Ver imagen ${i + 1}`}>
            <img src={url} alt={`Miniatura ${i + 1}`} loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-EC', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
}

// Curated palette for high contrast and distinctiveness
const ZONE_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
  '#84CC16', '#A855F7', '#0EA5E9', '#EAB308', '#F43F5E',
  '#22C55E', '#64748B', '#D946EF', '#0F766E', '#B45309',
];

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ZONE_COLORS[Math.abs(hash) % ZONE_COLORS.length];
}

function getVideoEmbedUrl(url: string): string {
  if (!url) return '';
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  return url;
}

interface SelectedSeat {
  seatId: string;
  zoneName: string;
  seatNumber: string;
  price: number;
}

export function EventDetailClient({ event }: { event: EventItem }) {
  const { user, token } = useAuth();
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResponse | null>(null);
  const [error, setError] = useState('');
  const [soldSeatIds, setSoldSeatIds] = useState<string[]>(
    event.zones.flatMap((z) => (z.seats || []).filter((s) => s.isSold).map((s) => s.id)),
  );

  const [loginToast, setLoginToast] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  function handleShare() { setShareOpen(true); }

  function handleCopyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    });
  }

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showLoginToast = () => {
    setLoginToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setLoginToast(false), 4000);
  };
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const toggleSeat = (seat: Seat, zoneName: string, price: number) => {
    if (!user) { showLoginToast(); return; }
    if (seat.isSold || soldSeatIds.includes(seat.id)) return;
    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.seatId === seat.id);
      if (exists) return prev.filter((s) => s.seatId !== seat.id);
      return [...prev, { seatId: seat.id, zoneName, seatNumber: seat.number || '?', price }];
    });
  };

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const allZonesFree = event.zones.length > 0 && event.zones.every(z => Number(z.price) === 0 || z.sellOnSite);

  // Traduce los mensajes técnicos del backend (en inglés, con IDs) a textos
  // claros y accionables para el comprador. Evita exponer UUIDs de asientos.
  const friendlyPurchaseError = (raw?: string): string => {
    const msg = (raw || '').toLowerCase();
    if (msg.includes('held by another') || msg.includes('being held')) {
      return 'Alguien más está reservando esas entradas ahora mismo. Espera un par de minutos o elige otras.';
    }
    if (msg.includes('already sold')) {
      return 'Una o más entradas que elegiste acaban de venderse. Por favor selecciona otras.';
    }
    if (msg.includes('do not hold the lock') || msg.includes('select seats again')) {
      return 'Tu reserva expiró. Vuelve a seleccionar tus entradas e inténtalo de nuevo.';
    }
    if (msg.includes('not found')) {
      return 'Algunas entradas ya no están disponibles. Actualiza la página e inténtalo de nuevo.';
    }
    if (msg.includes('do not belong')) {
      return 'Hubo un problema con las entradas seleccionadas. Vuelve a elegirlas, por favor.';
    }
    if (msg.includes('payment') && msg.includes('fail')) {
      return 'No se pudo procesar el pago. Inténtalo nuevamente en unos momentos.';
    }
    if (msg.includes('deshabilitada')) {
      // Mensaje ya viene en español y amigable desde el backend (kill-switch de pagos).
      return raw as string;
    }
    if (msg.includes('no seats')) {
      return 'Selecciona al menos una entrada para continuar.';
    }
    return 'No pudimos completar tu compra. Inténtalo de nuevo en unos momentos.';
  };

  const handlePurchase = async () => {
    if (!token || selectedSeats.length === 0) return;
    setPurchasing(true);
    setError('');
    const seatIds = selectedSeats.map((s) => s.seatId);
    try {
      await lockSeats(event.id, seatIds, token);
      const result = await purchaseTickets(event.id, seatIds, token);
      setPurchaseResult(result);
      setSoldSeatIds((prev) => [...prev, ...seatIds]);
      setSelectedSeats([]);
    } catch (err: any) {
      setError(friendlyPurchaseError(err?.message));
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <section className="section" style={{ paddingTop: '8rem' }}>
      <div className="section-inner">
        <div className="event-detail animate-fade-in">
          {/* Hero Image */}
          <div className="event-detail-hero">
            <img
              className="event-detail-hero-banner"
              src={event.bannerImageUrl || event.imageUrl || '/default-banner.jpg'}
              alt={event.title}
              loading="lazy"
              fetchPriority="high"
              decoding="async"
            />
            <img
              className="event-detail-hero-square"
              src={event.squareImageUrl || event.imageUrl || event.bannerImageUrl || '/default-banner.jpg'}
              alt={event.title}
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="event-content-grid">
            {/* Left Column */}
            <div className="event-content-left">
              <h1>{event.title}</h1>

              <div className="event-info-grid">
                <div className="info-item">
                  <div className="info-item-icon">📅</div>
                  <div className="info-item-content">
                    <span className="info-item-label">Fecha y hora</span>
                    <span className="info-item-value">{formatDate(event.date)}, {formatTime(event.date)}</span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-item-icon">📍</div>
                  <div className="info-item-content">
                    <span className="info-item-label">Lugar</span>
                    <span className="info-item-value">{event.location}</span>
                  </div>
                </div>
                {(event.province || event.city) && (
                  <div className="info-item">
                    <div className="info-item-icon">🌍</div>
                    <div className="info-item-content">
                      <span className="info-item-label">Provincia / Ciudad</span>
                      <span className="info-item-value">
                        {event.province}{event.province && event.city ? ' - ' : ''}{event.city}
                      </span>
                    </div>
                  </div>
                )}
                <div className="info-item">
                  <div className="info-item-icon">🎭</div>
                  <div className="info-item-content">
                    <span className="info-item-label">Categoría</span>
                    <span className="info-item-value">{event.category || 'General'}</span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-item-icon">
                    {event.organizer?.organizerProfile?.organizationLogo ? (
                      <img src={event.organizer.organizerProfile.organizationLogo} alt={event.organizer.organizerProfile.organizationName || event.organizer.name} className="organizer-avatar" loading="lazy" decoding="async" />
                    ) : (
                      <div className="organizer-avatar organizer-avatar--fallback">
                        {(event.organizer?.organizerProfile?.organizationName || event.organizer?.name || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="info-item-content">
                    <span className="info-item-label">Publicado por</span>
                    <span className="info-item-value">{event.organizer?.organizerProfile?.organizationName || event.organizer?.name || 'Desconocido'}</span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-item-icon">
                    <button className="share-btn" onClick={handleShare} title="Compartir evento">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                    </button>
                  </div>
                  <div className="info-item-content">
                    <span className="info-item-label">Compartir</span>
                    <span className="info-item-value" style={{ color: shareCopied ? 'var(--color-primary)' : undefined }}>
                      {shareCopied ? '¡Enlace copiado!' : 'Compartir evento'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="event-detail-description">
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Descripción</h3>
                {event.description || 'Sin descripción disponible.'}
              </div>

              {event.mapUrl && (
                <div className="event-detail-map" style={{ marginTop: '2rem' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Ubicación</h3>
                  <div style={{ overflow: 'hidden', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', aspectRatio: '21/9' }}>
                    <iframe src={event.mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Mapa del evento" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <a
                      className="map-directions-btn"
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        [event.location, event.city].filter(Boolean).join(', ') || event.title
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Abrir indicaciones en Google Maps"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polygon points="3 11 22 2 13 21 11 13 3 11" />
                      </svg>
                      Cómo llegar
                    </a>
                  </div>
                </div>
              )}

              {event.videoUrl && (
                <div className="event-detail-video" style={{ marginTop: '2rem' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Video</h3>
                  <div style={{ overflow: 'hidden', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', aspectRatio: '16/9' }}>
                    <iframe src={getVideoEmbedUrl(event.videoUrl)} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Video del evento" />
                  </div>
                </div>
              )}

              {event.galleryUrls && event.galleryUrls.length > 0 && (
                <EventGallery urls={event.galleryUrls} />
              )}

              {purchaseResult && (
                <div className="alert alert-success" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                  <div style={{ marginBottom: '0.75rem', fontSize: '1.1rem', fontWeight: 600 }}>🎉 ¡Compra exitosa!</div>
                  <div style={{ fontSize: '0.9rem', color: 'rgba(110, 231, 183, 0.8)', lineHeight: 1.8 }}>
                    <div>📋 Orden: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '0.15rem 0.4rem', borderRadius: 4 }}>{purchaseResult.orderId.slice(0, 8)}...</code></div>
                    <div>🎫 {purchaseResult.ticketCount} ticket{purchaseResult.ticketCount > 1 ? 's' : ''}</div>
                    <div>💰 Total: ${Number(purchaseResult.totalAmount).toFixed(2)}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Ticket Selection */}
            <div className="event-content-right">
              <div className="tickets-sidebar-card">
                <div className="tickets-sidebar-header">Localidades</div>

                {event.seatingMapImageUrl && (
                  <div className="seating-map-container" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    <img src={event.seatingMapImageUrl} alt="Mapa de Localidades" style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} loading="lazy" decoding="async" />
                  </div>
                )}

                {loginToast && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1rem', animation: 'fadeIn 0.2s ease' }}>
                    <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>🔒</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>Debes iniciar sesión para seleccionar entradas</p>
                      <Link href={`/login?redirect=${encodeURIComponent(`/eventos/${event.slug || event.id}`)}`} style={{ fontSize: '0.8rem', fontWeight: 600, color: '#F59E0B', textDecoration: 'underline' }}>
                        Iniciar sesión →
                      </Link>
                    </div>
                    <button onClick={() => setLoginToast(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: 0 }} aria-label="Cerrar">✕</button>
                  </div>
                )}

                <div className="zones-list">
                  {event.zones.map((zone) => {
                    const availableCount = (zone.seats || []).filter((s) => !s.isSold && !soldSeatIds.includes(s.id)).length;
                    const isSoldOut = availableCount === 0;

                    if (zone.sellOnSite) {
                      return (
                        <div key={zone.id} className="zone-item-sidebar" style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-color)' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                            <span style={{ flexShrink: 0, width: '12px', height: '12px', borderRadius: '50%', backgroundColor: stringToColor(zone.name), display: 'inline-block', marginTop: '0.3rem' }} />
                            <div>
                              <h3 style={{ margin: 0, fontWeight: 600 }}>{zone.name}</h3>
                              {zone.description && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontWeight: 400, lineHeight: '1.4' }}>{zone.description}</div>}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(106,196,77,0.08)', border: '1px solid rgba(106,196,77,0.2)', borderRadius: 'var(--radius-md)' }}>
                                <span style={{ fontSize: '1rem' }}>🎟️</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 500 }}>Entradas disponibles en el lugar y día del evento</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={zone.id} className="zone-item-sidebar" style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-color)', opacity: isSoldOut ? 0.7 : 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600 }}>
                          <div className="zone-info">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: stringToColor(zone.name), display: 'inline-block' }} />
                              {zone.name}
                              {isSoldOut && <span style={{ fontSize: '0.6rem', background: '#EF4444', color: 'white', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', marginTop: '1px' }}>Agotado</span>}
                            </h3>
                            {zone.description && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', marginBottom: '0.5rem', fontWeight: 400, lineHeight: '1.4' }}>{zone.description}</div>}
                          </div>
                          <span>{Number(zone.price) === 0 ? 'GRATIS' : `$${Number(zone.price).toFixed(2)}`}</span>
                        </div>

                        {Number(zone.price) !== 0 && (event.hasSeatingChart !== false && zone.capacity <= 50 ? (
                          zone.seats && zone.seats.length > 0 ? (
                            <div className="zone-seats" style={{ gap: '0.25rem', flexWrap: 'wrap', display: 'flex' }}>
                              {zone.seats.map((seat) => {
                                const isSold = seat.isSold || soldSeatIds.includes(seat.id);
                                const isSelected = selectedSeats.some((s) => s.seatId === seat.id);
                                return (
                                  <button key={seat.id} className={`seat ${isSold ? 'seat-sold' : isSelected ? 'seat-selected' : 'seat-available'}`}
                                    onClick={() => !isSold && toggleSeat(seat, zone.name, Number(zone.price))}
                                    disabled={isSold}
                                    style={{ width: 28, height: 28, fontSize: '0.6rem', backgroundColor: isSelected ? stringToColor(zone.name) : undefined, borderColor: isSelected ? stringToColor(zone.name) : undefined, color: isSelected ? 'white' : undefined }}
                                    title={`Asiento ${seat.number}`}
                                  >{seat.number}</button>
                                );
                              })}
                            </div>
                          ) : <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No hay asientos configurados</div>
                        ) : (
                          <div className="ga-selector">
                            {(() => {
                              const currentQty = selectedSeats.filter((s) => s.zoneName === zone.name).length;
                              return (
                                <div>
                                  <div style={{ fontSize: '0.8rem', color: isSoldOut ? '#EF4444' : 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: isSoldOut ? 600 : 400 }}>
                                    {isSoldOut ? '¡No quedan entradas! 😢' : `Disponibles: ${availableCount}`}
                                  </div>
                                  {!isSoldOut && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <button className="btn btn-secondary btn-sm" disabled={currentQty === 0}
                                        onClick={() => {
                                          if (!user) { showLoginToast(); return; }
                                          const seatsInZone = selectedSeats.filter((s) => s.zoneName === zone.name);
                                          if (seatsInZone.length > 0) setSelectedSeats((prev) => prev.filter((s) => s.seatId !== seatsInZone[seatsInZone.length - 1].seatId));
                                        }}>-</button>
                                      <span style={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{currentQty}</span>
                                      <button className="btn btn-secondary btn-sm" disabled={user ? availableCount <= currentQty : false}
                                        onClick={() => {
                                          if (!user) { showLoginToast(); return; }
                                          const availableInZone = (zone.seats || []).filter((s) => !s.isSold && !soldSeatIds.includes(s.id) && !selectedSeats.some((sel) => sel.seatId === s.id));
                                          if (availableInZone.length > 0) toggleSeat(availableInZone[0], zone.name, Number(zone.price));
                                        }}>+</button>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                {!user && (
                  <div style={{ marginBottom: '0', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Inicia sesión para reservar/comprar entradas.</p>
                    <Link href={`/login?redirect=${encodeURIComponent(`/eventos/${event.slug || event.id}`)}`} className="btn btn-primary btn-sm btn-full">Iniciar Sesión</Link>
                  </div>
                )}

                {error && (
                  <div role="alert" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1rem', animation: 'fadeIn 0.2s ease' }}>
                    <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>⚠️</span>
                    <p style={{ flex: 1, fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>{error}</p>
                    <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: 0 }} aria-label="Cerrar">✕</button>
                  </div>
                )}

                <div className="ticket-purchase-action">
                  {user && !allZonesFree && (
                    <div className="total-row">
                      <span>Total</span>
                      <span style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>${totalPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {user && !allZonesFree && (
                    <button className="btn btn-primary btn-full" onClick={handlePurchase} disabled={purchasing || selectedSeats.length === 0}>
                      {purchasing ? 'Procesando...' : 'Comprar >'}
                    </button>
                  )}
                  {user && !allZonesFree && selectedSeats.length === 0 && (
                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Selecciona tus entradas/asientos arriba</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {shareOpen && (
        <div className="share-modal-overlay" onClick={() => setShareOpen(false)}>
          <div className="share-modal" onClick={e => e.stopPropagation()}>
            <div className="share-modal-header">
              <span className="share-modal-title">Compartir</span>
              <button className="share-modal-close" onClick={() => setShareOpen(false)}>✕</button>
            </div>
            <div className="share-modal-networks">
              <a className="share-network-btn" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" onClick={() => setShareOpen(false)}>
                <span className="share-network-icon" style={{ background: '#1877F2' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></span>
                <span className="share-network-label">Facebook</span>
              </a>
              <a className="share-network-btn" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(event.title)}`} target="_blank" rel="noopener noreferrer" onClick={() => setShareOpen(false)}>
                <span className="share-network-icon" style={{ background: '#000' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></span>
                <span className="share-network-label">X (Twitter)</span>
              </a>
              <a className="share-network-btn" href={`https://wa.me/?text=${encodeURIComponent(event.title + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`} target="_blank" rel="noopener noreferrer" onClick={() => setShareOpen(false)}>
                <span className="share-network-icon" style={{ background: '#25D366' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg></span>
                <span className="share-network-label">WhatsApp</span>
              </a>
              <a className="share-network-btn" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" onClick={() => setShareOpen(false)}>
                <span className="share-network-icon" style={{ background: '#0A66C2' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg></span>
                <span className="share-network-label">LinkedIn</span>
              </a>
              <a className="share-network-btn" href={`mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} onClick={() => setShareOpen(false)}>
                <span className="share-network-icon" style={{ background: '#555' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></span>
                <span className="share-network-label">Correo</span>
              </a>
            </div>
            <div className="share-copy-row">
              <span className="share-copy-url">{typeof window !== 'undefined' ? window.location.href : ''}</span>
              <button className={`share-copy-btn${shareCopied ? ' share-copy-btn--copied' : ''}`} onClick={handleCopyLink} title="Copiar enlace">
                {shareCopied
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
