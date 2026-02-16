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
                        <span>{zone.name}</span>
                        <span>${Number(zone.price).toFixed(2)}</span>
                      </div>

                      {zone.seats && zone.seats.length > 0 ? (
                        <div className="zone-seats" style={{ gap: '0.25rem' }}>
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
                                }} // Smaller seats for sidebar
                                title={`Asiento ${seat.number}`}
                              >
                                {seat.number}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        /* General Admission logic would go here, currently assuming seated for demo */
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                          }}
                        >
                          Entrada General
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
