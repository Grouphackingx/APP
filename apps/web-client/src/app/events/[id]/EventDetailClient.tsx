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
    <div className="event-detail animate-fade-in">
      {/* Hero Image */}
      <div className="event-detail-hero">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} />
        ) : (
          <span className="placeholder-icon">🎶</span>
        )}
      </div>

      {/* Event Info */}
      <h1>{event.title}</h1>

      <div className="event-detail-info">
        <span>📅 {formatDate(event.date)}</span>
        <span>⏰ {formatTime(event.date)}</span>
        <span>📍 {event.location}</span>
        {event.organizer && <span>🎤 Organiza: {event.organizer.name}</span>}
      </div>

      {event.description && (
        <div className="event-detail-description">{event.description}</div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Purchase Success */}
      {purchaseResult && (
        <div
          className="alert alert-success"
          style={{ marginBottom: '2rem', fontSize: '1rem', padding: '1.25rem' }}
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
              {purchaseResult.ticketCount > 1 ? 's' : ''} generado
              {purchaseResult.ticketCount > 1 ? 's' : ''}
            </div>
            <div>
              💰 Total: ${Number(purchaseResult.totalAmount).toFixed(2)}
            </div>
            <div
              style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.7 }}
            >
              Cada ticket contiene un código QR firmado digitalmente para
              validación en la entrada.
            </div>
          </div>
        </div>
      )}

      {/* Zones & Seats */}
      <div className="zones-section">
        <h2>🪑 Selecciona tus Asientos</h2>

        {!user && (
          <div
            style={{
              background: 'var(--bg-glass-light)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}
          >
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              🔐 Debes iniciar sesión para comprar tickets
            </p>
            <Link href="/login" className="btn btn-primary">
              Iniciar Sesión
            </Link>
          </div>
        )}

        {event.zones.map((zone) => (
          <div key={zone.id} className="zone-card" id={`zone-${zone.id}`}>
            <div className="zone-card-header">
              <h3>🏟️ {zone.name}</h3>
              <div className="zone-price">${Number(zone.price).toFixed(2)}</div>
            </div>

            {zone.seats && zone.seats.length > 0 ? (
              <div className="zone-seats">
                {zone.seats.map((seat) => {
                  const isSold = seat.isSold || soldSeatIds.includes(seat.id);
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
                        toggleSeat(seat, zone.name, Number(zone.price))
                      }
                      disabled={isSold || !user}
                      title={
                        isSold
                          ? 'Vendido'
                          : isSelected
                            ? 'Seleccionado'
                            : `Asiento ${seat.number}`
                      }
                      id={`seat-${seat.id}`}
                    >
                      {seat.number}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {zone.capacity} entradas disponibles (admisión general)
              </p>
            )}

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '0.75rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              <span
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    background: 'rgba(16,185,129,0.3)',
                    display: 'inline-block',
                  }}
                />
                Disponible
              </span>
              <span
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    background: 'rgba(139,92,246,0.3)',
                    display: 'inline-block',
                  }}
                />
                Seleccionado
              </span>
              <span
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    background: 'rgba(100,116,139,0.2)',
                    display: 'inline-block',
                  }}
                />
                Vendido
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Purchase Summary (sticky bottom bar) */}
      {user && selectedSeats.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(10, 10, 15, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderTop: '1px solid var(--border-color-hover)',
            padding: '1rem 2rem',
            zIndex: 50,
            animation: 'fadeInUp 0.3s ease',
          }}
        >
          <div
            style={{
              maxWidth: 1000,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div
                style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}
              >
                {selectedSeats.length} asiento
                {selectedSeats.length > 1 ? 's' : ''} seleccionado
                {selectedSeats.length > 1 ? 's' : ''}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--color-secondary-light)',
                }}
              >
                Total: ${totalPrice.toFixed(2)}
              </div>
            </div>
            <button
              className="btn btn-accent btn-lg"
              onClick={handlePurchase}
              disabled={purchasing}
              id="purchase-btn"
            >
              {purchasing ? (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    className="spinner"
                    style={{ width: 18, height: 18, borderWidth: 2 }}
                  />
                  Procesando...
                </span>
              ) : (
                '🎫 Comprar Tickets'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
