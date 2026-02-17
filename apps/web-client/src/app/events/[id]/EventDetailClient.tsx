'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { EventItem, Seat, PurchaseResponse } from '../../../lib/api';
import { lockSeats, purchaseTickets } from '../../../lib/api';
import { useAuth } from '../../../lib/AuthContext';

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
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResponse | null>(
    null,
  );
  const [error, setError] = useState('');
  const [soldSeatIds, setSoldSeatIds] = useState<string[]>(
    event.zones.flatMap((z) =>
      (z.seats || []).filter((s) => s.isSold).map((s) => s.id),
    ),
  );

  const toggleSeat = (seat: Seat, zoneName: string, price: number) => {
    if (seat.isSold || soldSeatIds.includes(seat.id)) return;

    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.seatId === seat.id);
      if (exists) {
        return prev.filter((s) => s.seatId !== seat.id);
      }
      return [
        ...prev,
        {
          seatId: seat.id,
          zoneName,
          seatNumber: seat.number || '?',
          price,
        },
      ];
    });
  };

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const handlePurchase = async () => {
    if (!token || selectedSeats.length === 0) return;
    setPurchasing(true);
    setError('');

    const seatIds = selectedSeats.map((s) => s.seatId);

    try {
      // Step 1: Lock seats
      await lockSeats(event.id, seatIds, token);

      // Step 2: Purchase (creates order + tickets with QR)
      const result = await purchaseTickets(event.id, seatIds, token);

      setPurchaseResult(result);
      // Mark seats as sold locally
      setSoldSeatIds((prev) => [...prev, ...seatIds]);
      setSelectedSeats([]);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la compra');
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
            {event.imageUrl ? (
              <img src={event.imageUrl} alt={event.title} />
            ) : (
              <span className="placeholder-icon">🎶</span>
            )}
          </div>

          <div className="event-content-grid">
            {/* Left Column: Text Content */}
            <div className="event-content-left">
              <h1>{event.title}</h1>

              {/* Info Grid */}
              <div className="event-info-grid">
                <div className="info-item">
                  <div className="info-item-icon">📅</div>
                  <div className="info-item-content">
                    <span className="info-item-label">Fecha y hora</span>
                    <span className="info-item-value">
                      {formatDate(event.date)}, {formatTime(event.date)}
                    </span>
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
                      <span className="info-item-label">
                        Provincia / Ciudad
                      </span>
                      <span className="info-item-value">
                        {event.province}
                        {event.province && event.city ? ' - ' : ''}
                        {event.city}
                      </span>
                    </div>
                  </div>
                )}

                {/* Placeholder Categories/Rating if available, assuming standard for now */}
                <div className="info-item">
                  <div className="info-item-icon">🎭</div>
                  <div className="info-item-content">
                    <span className="info-item-label">Categoría</span>
                    <span className="info-item-value">General</span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-item-icon">🎤</div>
                  <div className="info-item-content">
                    <span className="info-item-label">Organizador</span>
                    <span className="info-item-value">
                      {event.organizer?.name || 'Desconocido'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="event-detail-description">
                <h3
                  style={{
                    fontSize: '1.5rem',
                    marginBottom: '1rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  Descripción
                </h3>
                {event.description || 'Sin descripción disponible.'}
              </div>

              {/* Map Section */}
              {event.mapUrl && (
                <div className="event-detail-map" style={{ marginTop: '2rem' }}>
                  <h3
                    style={{
                      fontSize: '1.5rem',
                      marginBottom: '1rem',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Ubicación
                  </h3>
                  <div
                    style={{
                      overflow: 'hidden',
                      borderRadius: 'var(--radius-xl)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      aspectRatio: '21/9',
                    }}
                  >
                    <iframe
                      src={event.mapUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Mapa del evento"
                    />
                  </div>
                </div>
              )}

              {/* Video Section */}
              {event.videoUrl && (
                <div
                  className="event-detail-video"
                  style={{ marginTop: '2rem' }}
                >
                  <h3
                    style={{
                      fontSize: '1.5rem',
                      marginBottom: '1rem',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Video
                  </h3>
                  <div
                    style={{
                      overflow: 'hidden',
                      borderRadius: 'var(--radius-xl)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      aspectRatio: '16/9',
                    }}
                  >
                    <iframe
                      src={
                        event.videoUrl.includes('youtube.com/watch?v=')
                          ? event.videoUrl.replace('watch?v=', 'embed/')
                          : event.videoUrl
                      }
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      title="Video del evento"
                    />
                  </div>
                </div>
              )}

              {/* Gallery Section */}
              {event.galleryUrls && event.galleryUrls.length > 0 && (
                <div
                  className="event-detail-gallery"
                  style={{ marginTop: '2rem' }}
                >
                  <h3
                    style={{
                      fontSize: '1.5rem',
                      marginBottom: '1rem',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Galería
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2rem',
                    }}
                  >
                    {event.galleryUrls.map((url, i) => (
                      <div
                        key={i}
                        className="gallery-item"
                        style={{
                          borderRadius: 'var(--radius-xl)',
                          overflow: 'hidden',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-secondary)',
                          position: 'relative',
                        }}
                      >
                        <img
                          src={url}
                          alt={`Galería ${i + 1}`}
                          style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div
                  className="alert alert-error"
                  style={{ marginBottom: '1.5rem' }}
                >
                  ⚠️ {error}
                </div>
              )}

              {/* Success Alert */}
              {purchaseResult && (
                <div
                  className="alert alert-success"
                  style={{ marginBottom: '2rem', padding: '1.5rem' }}
                >
                  <div
                    style={{
                      marginBottom: '0.75rem',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    }}
                  >
                    🎉 ¡Compra exitosa!
                  </div>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      color: 'rgba(110, 231, 183, 0.8)',
                      lineHeight: 1.8,
                    }}
                  >
                    <div>
                      📋 Orden:{' '}
                      <code
                        style={{
                          background: 'rgba(0,0,0,0.2)',
                          padding: '0.15rem 0.4rem',
                          borderRadius: 4,
                        }}
                      >
                        {purchaseResult.orderId.slice(0, 8)}...
                      </code>
                    </div>
                    <div>
                      🎫 {purchaseResult.ticketCount} ticket
                      {purchaseResult.ticketCount > 1 ? 's' : ''}
                    </div>
                    <div>
                      💰 Total: ${Number(purchaseResult.totalAmount).toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Ticket Selection (Sticky) */}
            <div className="event-content-right">
              <div className="tickets-sidebar-card">
                <div className="tickets-sidebar-header">Localidades</div>

                {event.seatingMapImageUrl && (
                  <div
                    className="seating-map-container"
                    style={{ marginBottom: '1.5rem', textAlign: 'center' }}
                  >
                    <img
                      src={event.seatingMapImageUrl}
                      alt="Mapa de Localidades"
                      style={{
                        maxWidth: '100%',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                      }}
                    />
                  </div>
                )}

                {!user && (
                  <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Inicia sesión para comprar/seleccionar asientos.
                    </p>
                    <Link
                      href="/login"
                      className="btn btn-primary btn-sm btn-full"
                    >
                      Iniciar Sesión
                    </Link>
                  </div>
                )}

                <div className="zones-list">
                  {event.zones.map((zone) => (
                    <div
                      key={zone.id}
                      className="zone-item-sidebar"
                      style={{
                        marginBottom: '1rem',
                        paddingBottom: '1rem',
                        borderBottom: '1px dashed var(--border-color)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '0.5rem',
                          fontWeight: 600,
                        }}
                      >
                        <div className="zone-info">
                          <h3>{zone.name}</h3>
                          {zone.description && (
                            <div
                              style={{
                                fontSize: '0.85rem',
                                color: 'var(--text-secondary)',
                                marginTop: '0.25rem',
                                marginBottom: '0.5rem',
                                fontWeight: 400,
                                lineHeight: '1.4',
                              }}
                            >
                              {zone.description}
                            </div>
                          )}
                        </div>
                        <span>${Number(zone.price).toFixed(2)}</span>
                      </div>

                      {event.hasSeatingChart !== false &&
                      zone.capacity <= 50 ? (
                        /* Assigned Seating Logic */
                        zone.seats && zone.seats.length > 0 ? (
                          <div
                            className="zone-seats"
                            style={{
                              gap: '0.25rem',
                              flexWrap: 'wrap',
                              display: 'flex',
                            }}
                          >
                            {zone.seats.map((seat) => {
                              const isSold =
                                seat.isSold || soldSeatIds.includes(seat.id);
                              const isSelected = selectedSeats.some(
                                (s) => s.seatId === seat.id,
                              );
                              return (
                                <button
                                  key={seat.id}
                                  className={`seat ${isSold ? 'seat-sold' : isSelected ? 'seat-selected' : 'seat-available'}`}
                                  onClick={() =>
                                    user &&
                                    !isSold &&
                                    toggleSeat(
                                      seat,
                                      zone.name,
                                      Number(zone.price),
                                    )
                                  }
                                  disabled={isSold || !user}
                                  style={{
                                    width: 28,
                                    height: 28,
                                    fontSize: '0.6rem',
                                  }}
                                  title={`Asiento ${seat.number}`}
                                >
                                  {seat.number}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--text-muted)',
                            }}
                          >
                            No hay asientos configurados
                          </div>
                        )
                      ) : (
                        /* General Admission Logic */
                        <div className="ga-selector">
                          {(() => {
                            const availableSeats = (zone.seats || []).filter(
                              (s) => !s.isSold && !soldSeatIds.includes(s.id),
                            );
                            const currentQty = selectedSeats.filter(
                              (s) => s.zoneName === zone.name,
                            ).length;

                            return (
                              <div>
                                <div
                                  style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--text-muted)',
                                    marginBottom: '0.5rem',
                                  }}
                                >
                                  Disponibles: {availableSeats.length}
                                </div>
                                {user ? (
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                    }}
                                  >
                                    <button
                                      className="btn btn-secondary btn-sm"
                                      disabled={currentQty === 0}
                                      onClick={() => {
                                        // Remove last selected seat from this zone
                                        const seatsInZone =
                                          selectedSeats.filter(
                                            (s) => s.zoneName === zone.name,
                                          );
                                        if (seatsInZone.length > 0) {
                                          const lastSeat =
                                            seatsInZone[seatsInZone.length - 1];
                                          // Toggle off (remove)
                                          setSelectedSeats((prev) =>
                                            prev.filter(
                                              (s) =>
                                                s.seatId !== lastSeat.seatId,
                                            ),
                                          );
                                        }
                                      }}
                                    >
                                      -
                                    </button>
                                    <span
                                      style={{
                                        fontWeight: 600,
                                        minWidth: '20px',
                                        textAlign: 'center',
                                      }}
                                    >
                                      {currentQty}
                                    </span>
                                    <button
                                      className="btn btn-secondary btn-sm"
                                      disabled={
                                        availableSeats.length <= currentQty
                                      }
                                      onClick={() => {
                                        // Add next available seat
                                        const availableInZone = (
                                          zone.seats || []
                                        ).filter(
                                          (s) =>
                                            !s.isSold &&
                                            !soldSeatIds.includes(s.id) &&
                                            !selectedSeats.some(
                                              (sel) => sel.seatId === s.id,
                                            ),
                                        );
                                        if (availableInZone.length > 0) {
                                          const nextSeat = availableInZone[0];
                                          toggleSeat(
                                            nextSeat,
                                            zone.name,
                                            Number(zone.price),
                                          );
                                        }
                                      }}
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '0.8rem' }}>
                                    Inicia sesión para comprar
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Purchase Action */}
                <div className="ticket-purchase-action">
                  <div className="total-row">
                    <span>Total</span>
                    <span
                      style={{
                        fontSize: '1.25rem',
                        color: 'var(--color-primary)',
                      }}
                    >
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  {user && (
                    <button
                      className="btn btn-primary btn-full"
                      onClick={handlePurchase}
                      disabled={purchasing || selectedSeats.length === 0}
                    >
                      {purchasing ? 'Procesando...' : 'Comprar >'}
                    </button>
                  )}
                  {user && selectedSeats.length === 0 && (
                    <p
                      style={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.5rem',
                      }}
                    >
                      Selecciona tus asientos arriba
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
